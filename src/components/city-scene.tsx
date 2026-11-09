"use client";
import type { StoryRun } from "@/lib/stories";
import {
  Component,
  Suspense,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Agent } from "@/lib/simulation";
import HatchEffect from "./hatch-effect";
import type { HatchRun } from "@/lib/hatching";
import {
  EXCHANGE,
  GATE,
  type CityMoment,
  type StreetActivity,
} from "@/lib/city-life";
import CityEnvironment from "./city-environment";
import RoamingAgent from "./roaming-agent";
import { Box } from "./city-primitives";
import MetropolisEnvironment from "./metropolis-environment";
import {
  DISTRICTS,
  MAP_HALF,
  MIN_ZOOM,
  MAX_ZOOM,
  type MapFocus,
  type MapView,
} from "@/lib/metropolis";

type Props = {
  selectionKey: number;
  story: StoryRun | null;
  agents: Agent[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  onCreate: () => void;
  focus: MapFocus | null;
  onMapMove: (view: MapView) => void;
  zoom: number;
  reset: number;
  paused: boolean;
  hatching: HatchRun | null;
  moment: CityMoment | null;
  streetActivities: Record<string, StreetActivity>;
  onStreetActivity: (id: string, activity: StreetActivity | null) => void;
  onReplayHatch: () => void;
  onZoomChange: (zoom: number) => void;
};
const LabelContext = createContext<React.RefObject<
  Map<string, HTMLDivElement>
> | null>(null);
function Label({
  position,
  id,
}: {
  position: [number, number, number];
  id: string;
}) {
  const labels = useContext(LabelContext);
  const anchor = useRef<THREE.Group>(null);
  const vector = useMemo(() => new THREE.Vector3(), []);
  const { camera, size } = useThree();
  useFrame(() => {
    const element = labels?.current.get(id);
    if (!anchor.current || !element) return;
    let ancestor: THREE.Object3D | null = anchor.current;
    while (ancestor) {
      if (!ancestor.visible) {
        element.style.visibility = "hidden";
        return;
      }
      ancestor = ancestor.parent;
    }
    anchor.current.getWorldPosition(vector);
    vector.project(camera);
    element.style.transform = `translate3d(${(vector.x * 0.5 + 0.5) * size.width}px,${(-vector.y * 0.5 + 0.5) * size.height}px,0) translate(-50%,-50%)`;
    element.style.visibility =
      vector.z > 1 || anchor.current.matrixWorld.determinant() < 0.001
        ? "hidden"
        : "visible";
  });
  return <group ref={anchor} position={position} />;
}
const colors = ["#6c76ee", "#64d8d5", "#b28adb", "#eb75ac", "#f1ca72"];
function Building({
  x,
  z,
  h,
  w = 1.5,
  d = 1.5,
  color,
  active = true,
  onClick,
  exchange = false,
  selected = false,
}: {
  x: number;
  z: number;
  h: number;
  w?: number;
  d?: number;
  color: string;
  active?: boolean;
  onClick?: () => void;
  exchange?: boolean;
  selected?: boolean;
}) {
  const windows = useMemo(() => {
    const items: {
      p: [number, number, number];
      s: [number, number, number];
      lit: boolean;
    }[] = [];
    const rows = Math.floor(h / 0.34),
      cols = Math.floor(w / 0.24),
      depth = Math.floor(d / 0.24);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++)
        items.push({
          p: [-w / 2 + 0.16 + c * 0.24, 0.24 + r * 0.34, d / 2 + 0.009],
          s: [0.085, 0.13, 0.014],
          lit: (r * 7 + c * 3 + Math.floor(x * 7)) % 5 !== 0,
        });
      for (let c = 0; c < depth; c++)
        items.push({
          p: [w / 2 + 0.009, 0.24 + r * 0.34, -d / 2 + 0.16 + c * 0.24],
          s: [0.014, 0.13, 0.085],
          lit: (r * 3 + c * 7 + Math.floor(z * 7)) % 4 !== 0,
        });
    }
    return items;
  }, [h, w, d, x, z]);
  const windowsRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!windowsRef.current) return;
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const light = new THREE.Color();
    windows.forEach((v, i) => {
      matrix.compose(
        new THREE.Vector3(...v.p),
        rotation,
        new THREE.Vector3(...v.s),
      );
      windowsRef.current!.setMatrixAt(i, matrix);
      light.set(
        v.lit && active ? (i % 7 === 0 ? color : "#e4d4a7") : "#272b3f",
      );
      windowsRef.current!.setColorAt(i, light);
    });
    windowsRef.current.instanceMatrix.needsUpdate = true;
    if (windowsRef.current.instanceColor)
      windowsRef.current.instanceColor.needsUpdate = true;
  }, [windows, active, color]);
  return (
    <group
      position={[x, 0.08, z]}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
      onPointerOver={
        onClick
          ? () => {
              document.body.style.cursor = "pointer";
            }
          : undefined
      }
      onPointerOut={
        onClick
          ? () => {
              document.body.style.cursor = "auto";
            }
          : undefined
      }
    >
      <Box
        position={[0, h / 2, 0]}
        size={[w, h, d]}
        color={selected ? "#24263f" : "#111526"}
      />
      <instancedMesh
        ref={windowsRef}
        args={[undefined, undefined, windows.length]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <Box
        position={[0, h + 0.02, 0]}
        size={[w + 0.06, 0.035, d + 0.06]}
        color={active ? color : "#353949"}
        glow={active}
      />
      <Box
        position={[0, h + 0.06, 0]}
        size={[w - 0.05, 0.045, d - 0.05]}
        color="#111526"
      />
      {[
        [-w / 2, d / 2],
        [w / 2, d / 2],
        [w / 2, -d / 2],
      ].map(([a, b], i) => (
        <Box
          key={i}
          position={[a, h / 2, b]}
          size={[0.025, h, 0.025]}
          color={active ? color : "#30384a"}
          glow={active}
        />
      ))}
      {exchange && (
        <>
          <Box
            position={[0, h + 0.3, 0]}
            size={[w * 0.72, 0.5, d * 0.7]}
            color="#1e253a"
          />
          <Box
            position={[0, h + 0.59, 0]}
            size={[w * 0.76, 0.04, d * 0.74]}
            color={color}
            glow
          />
          <Box
            position={[0, h + 1, 0]}
            size={[0.06, 0.8, 0.06]}
            color={color}
            glow
          />
          <mesh position={[0, h + 1.4, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshBasicMaterial color="#fff5cb" />
          </mesh>
        </>
      )}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.28, 1.34, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
}
function Camera({
  selectionKey,
  zoom,
  reset,
  selected,
  agents,
  onZoomChange,
  hatching,
  focus,
  onMapMove,
}: Pick<
  Props,
  | "selectionKey"
  | "zoom"
  | "reset"
  | "selected"
  | "agents"
  | "onZoomChange"
  | "hatching"
  | "focus"
  | "onMapMove"
>) {
  const { camera, gl } = useThree();
  const actors = useContext(ActorContext);
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const agent = agents.find((a) => a.id === selected);
  const targetX = agent ? agent.position[0] * 0.23 : 0;
  const targetZ = agent ? agent.position[1] * 0.23 : 0;
  const targetY = 1.6;
  useEffect(() => {
    if (reset > 0) {
      controls.current?.reset();
      if (camera instanceof THREE.OrthographicCamera) {
        camera.zoom = zoom;
        camera.updateProjectionMatrix();
        onZoomChange(zoom);
      }
    }
  }, [reset]);
  useEffect(() => {
    if (!controls.current) return;
    const actor = selected ? actors?.current.get(selected) : null;
    const target = actor
      ? actor.getWorldPosition(new THREE.Vector3())
      : new THREE.Vector3(targetX, targetY, targetZ);
    target.y = targetY;
    camera.position.add(target.clone().sub(controls.current.target));
    controls.current.target.copy(target);
    controls.current.update();
  }, [selected, selectionKey, targetX, targetY, targetZ, camera, reset]);
  useEffect(() => {
    if (!focus || !controls.current) return;
    const target = new THREE.Vector3(focus.x, 1.6, focus.z);
    camera.position.add(target.clone().sub(controls.current.target));
    controls.current.target.copy(target);
    controls.current.update();
  }, [focus?.key, camera]);
  const lastView = useRef(0);
  useEffect(() => {
    const surface = gl.domElement.closest(".canvas-wrap");
    if (!surface || !(camera instanceof THREE.OrthographicCamera)) return;
    // Capture on the entire map, including the HTML building labels. Panels are
    // siblings, so scrolling their content never zooms the map.
    const wheel = (event: Event) => {
      const e = event as WheelEvent;
      if (!e.deltaY) return;
      e.preventDefault();
      e.stopPropagation();
      const bounds = gl.domElement.getBoundingClientRect();
      const cursor = new THREE.Vector3(
        ((e.clientX - bounds.left) / bounds.width) * 2 - 1,
        (-(e.clientY - bounds.top) / bounds.height) * 2 + 1,
        0,
      );
      const before = cursor.clone().unproject(camera);
      const pixels =
        e.deltaY *
        (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? bounds.height : 1);
      camera.zoom = THREE.MathUtils.clamp(
        camera.zoom *
          Math.exp(-THREE.MathUtils.clamp(pixels, -160, 160) * 0.002),
        MIN_ZOOM,
        MAX_ZOOM,
      );
      camera.updateProjectionMatrix();
      const offset = before.sub(cursor.unproject(camera));
      camera.position.add(offset);
      controls.current?.target.add(offset);
      camera.updateMatrixWorld();
      controls.current?.update();
      onZoomChange(camera.zoom);
    };
    surface.addEventListener("wheel", wheel, { passive: false, capture: true });
    return () => surface.removeEventListener("wheel", wheel, true);
  }, [camera, gl, onZoomChange]);
  useLayoutEffect(() => {
    if (
      camera instanceof THREE.OrthographicCamera &&
      Math.abs(camera.zoom - zoom) > 0.01
    ) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
      controls.current?.update();
    }
  }, [zoom, camera]);
  const change = () => {
    const c = controls.current;
    if (!c) return;
    const before = c.target.clone();
    c.target.clamp(
      new THREE.Vector3(-MAP_HALF, -3, -MAP_HALF),
      new THREE.Vector3(MAP_HALF, 9, MAP_HALF),
    );
    camera.position.add(c.target.clone().sub(before));
    if (performance.now() - lastView.current > 120) {
      lastView.current = performance.now();
      onMapMove({
        x: c.target.x,
        z: c.target.z,
        zoom: camera instanceof THREE.OrthographicCamera ? camera.zoom : zoom,
      });
    }
    if (
      camera instanceof THREE.OrthographicCamera &&
      Math.abs(camera.zoom - zoom) > 0.01
    )
      onZoomChange(camera.zoom);
  };
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableRotate={false}
      enableZoom
      zoomToCursor
      zoomSpeed={0.75}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      enablePan
      enableDamping
      dampingFactor={0.12}
      panSpeed={0.8}
      onChange={change}
      minPolarAngle={0.65}
      maxPolarAngle={1.1}
      mouseButtons={{
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }}
    />
  );
}
const ActorContext = createContext<React.RefObject<
  Map<string, THREE.Group>
> | null>(null);
function Exchange({
  run,
  onCreate,
}: {
  run: HatchRun | null;
  onCreate: () => void;
}) {
  const doors = useRef<THREE.Group>(null),
    scan = useRef<THREE.Mesh>(null),
    halo = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const elapsed = run ? performance.now() - run.startedAt : 0;
    const open = run
      ? THREE.MathUtils.smoothstep(elapsed, 3800, 4600) *
        (1 - THREE.MathUtils.smoothstep(elapsed, 7600, 8500))
      : 0;
    doors.current?.children.forEach(
      (door, i) =>
        (door.position.x = (i === 0 ? -1 : 1) * (0.29 + open * 0.58)),
    );
    if (scan.current) {
      scan.current.visible = !!run && elapsed < 4300;
      scan.current.position.y = 1.2 + ((elapsed % 2200) / 2200) * 5.2;
    }
    if (halo.current) {
      halo.current.rotation.z = clock.elapsedTime * 0.15;
      halo.current.scale.setScalar(
        1 +
          Math.sin(clock.elapsedTime * (run ? 4 : 1.4)) * (run ? 0.08 : 0.015),
      );
    }
  });
  return (
    <group>
      <Box
        position={[0, 0.16, EXCHANGE.z]}
        size={[5.7, 0.32, 4.6]}
        color="#303047"
      />
      <Box
        position={[0, 0.34, EXCHANGE.z]}
        size={[5.8, 0.04, 4.7]}
        color="#d6b47b"
        glow
      />
      <Building
        x={EXCHANGE.x}
        z={EXCHANGE.z}
        h={EXCHANGE.height}
        w={EXCHANGE.width}
        d={EXCHANGE.depth}
        color="#e9b96c"
        exchange
        onClick={onCreate}
      />
      <Box
        position={[0, 0.88, GATE[1] - 0.08]}
        size={[1.5, 1.7, 0.08]}
        color="#0c1020"
      />
      <Box
        position={[0, 1.78, GATE[1] - 0.02]}
        size={[1.65, 0.1, 0.12]}
        color={run ? "#a9e9d9" : "#e9c68c"}
        glow
      />
      {[-0.8, 0.8].map((x) => (
        <Box
          key={x}
          position={[x, 0.92, GATE[1] - 0.02]}
          size={[0.065, 1.7, 0.1]}
          color="#e9c68c"
          glow
        />
      ))}
      <group ref={doors} position={[0, 0.9, GATE[1]]}>
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.29, 0, 0]}>
            <Box
              position={[0, 0, 0]}
              size={[0.56, 1.5, 0.08]}
              color="#34566a"
            />
            <Box
              position={[side * 0.19, 0, 0.06]}
              size={[0.025, 1.42, 0.02]}
              color="#b4e8e4"
              glow
            />
          </group>
        ))}
      </group>
      <Box
        position={[0, 0.12, GATE[1] + 0.45]}
        size={[2.4, 0.24, 1]}
        color="#57506a"
      />
      <Box
        position={[0, 0.05, GATE[1] + 1]}
        size={[2.8, 0.1, 0.45]}
        color="#464057"
      />
      <mesh ref={scan} position={[0, 2, GATE[1] + 0.05]} visible={false}>
        <boxGeometry args={[4.7, 0.13, 0.04]} />
        <meshBasicMaterial
          color="#9ce7dd"
          transparent
          opacity={0.6}
          toneMapped={false}
        />
      </mesh>
      <mesh
        ref={halo}
        position={[0, EXCHANGE.height + 0.9, EXCHANGE.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[1.2, 1.25, 64]} />
        <meshBasicMaterial
          color="#e9c68c"
          transparent
          opacity={run ? 0.7 : 0.3}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <Label id="exchange" position={[0, EXCHANGE.height + 1.7, EXCHANGE.z]} />
      <Label id="gate" position={[1.9, 1.35, GATE[1] + 0.3]} />
    </group>
  );
}
function World(
  props: Props & {
    exited: Set<string>;
    bindActor: (id: string, actor: THREE.Group | null) => void;
  },
) {
  const decor = [
    { x: -6.3, z: -5.4, h: 2.7, w: 1.4, d: 1.5, color: "#7688bf" },
    { x: -3.7, z: -6.4, h: 2.1, w: 1.35, d: 1.25, color: "#a484b5" },
    { x: 3.7, z: -6.4, h: 3.1, w: 1.3, d: 1.5, color: "#7a9d9d" },
    { x: 6.3, z: -5.4, h: 2.3, w: 1.5, d: 1.5, color: "#ac899e" },
    { x: -7, z: -2.8, h: 1.6, w: 1.2, d: 1.3, color: "#a6a080" },
    { x: 7, z: -2.8, h: 1.9, w: 1.2, d: 1.3, color: "#8a8eb8" },
  ];
  const born = props.agents.find((a) => a.id === props.hatching?.agentId);
  return (
    <>
      <color attach="background" args={["#11101e"]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[8, 18, 12]} intensity={2} color="#9d9bdb" />
      <directionalLight
        position={[-10, 8, -8]}
        intensity={1.2}
        color="#ac65af"
      />
      <group position={[0, -0.4, 0]}>
        <Box position={[0, -0.28, 0]} size={[68, 0.55, 68]} color="#171527" />
        <Box
          position={[0, -0.005, 0]}
          size={[68.1, 0.025, 68.1]}
          color="#7d66b6"
          glow
        />
        <Box
          position={[0, 0.025, 0]}
          size={[67.9, 0.05, 67.9]}
          color="#171a2a"
        />
        <MetropolisEnvironment paused={props.paused} />
        <CityEnvironment paused={props.paused} moment={props.moment} />
        {decor.map((b, i) => (
          <Building key={i} {...b} />
        ))}
        <Exchange run={props.hatching} onCreate={props.onCreate} />
        {props.agents
          .filter((a) => a.id !== props.hatching?.agentId)
          .map((a, i) => (
            <RoamingAgent
              key={a.id}
              agent={a}
              story={
                props.story &&
                [
                  props.story.record.agentId,
                  props.story.record.partnerId,
                ].includes(a.id)
                  ? props.story
                  : null
              }
              index={i}
              paused={props.paused}
              selected={props.selected === a.id}
              onSelect={() => props.onSelect(a.id)}
              onActivity={props.onStreetActivity}
              danceParty={props.moment?.kind === "party"}
              spawnAtGate={props.exited.has(a.id)}
              bindActor={props.bindActor}
            >
              <Label id={a.id + "-story"} position={[0, 1.8, 0]} />
              <Label id={a.id} position={[0, 0.8, 0]} />
              <Label id={a.id + "-activity"} position={[0, 1.3, 0]} />
              {a.status === "sleeping" && (
                <Label id={a.id + "-sleep"} position={[0.45, 0.55, 0]} />
              )}
            </RoamingAgent>
          ))}
        {props.hatching && born && (
          <HatchEffect
            key={props.hatching.key}
            agent={born}
            run={props.hatching}
          >
            <Label id="hatch" position={[0, 1.1, 0]} />
          </HatchEffect>
        )}
        {DISTRICTS.filter((d) => d.id !== "genesis").map((d) => (
          <Label key={d.id} id={"district-" + d.id} position={[d.x, 3, d.z]} />
        ))}
        <Label id="cafe" position={[-6, 1.9, 5.7]} />
        <Label id="park" position={[-5.7, 0.2, 0.2]} />
        <Label id="plaza" position={[4.7, 0.3, 3.1]} />
      </group>
      <Camera
        selectionKey={props.selectionKey}
        zoom={props.zoom}
        focus={props.focus}
        onMapMove={props.onMapMove}
        reset={props.reset}
        selected={props.selected}
        agents={props.agents}
        onZoomChange={props.onZoomChange}
        hatching={props.hatching}
      />
    </>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-fallback">
        <span>✦</span>
        <h2>The city needs WebGL</h2>
        <p>
          Enable hardware acceleration to explore the 3D city.
          <br />
          You can still use every agent card and simulation control.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function CityScene(props: Props) {
  const [ready, setReady] = useState(false);
  const labels = useRef(new Map<string, HTMLDivElement>());
  const actors = useRef(new Map<string, THREE.Group>());
  const exited = useRef(new Set<string>());
  useEffect(() => {
    if (props.hatching) exited.current.add(props.hatching.agentId);
  }, [props.hatching?.key]);
  const bindActor = useCallback((id: string, actor: THREE.Group | null) => {
    if (actor) actors.current.set(id, actor);
    else actors.current.delete(id);
  }, []);
  const bind = (id: string) => (node: HTMLDivElement | null) => {
    if (node) labels.current.set(id, node);
    else labels.current.delete(id);
  };
  return (
    <SceneBoundary>
      <div className="canvas-wrap">
        {!ready && (
          <div className="city-loading">
            <span className="loading-orbit" />
            Lighting up the neighborhood…
          </div>
        )}
        <ActorContext.Provider value={actors}>
          <LabelContext.Provider value={labels}>
            <Canvas
              orthographic
              camera={{
                position: [70, 64, 83],
                zoom: props.zoom,
                near: 0.1,
                far: 300,
              }}
              dpr={[1, 1.7]}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
                toneMapping: THREE.NoToneMapping,
              }}
              onCreated={() => setReady(true)}
              onPointerMissed={() => props.onSelect(null)}
            >
              <Suspense fallback={null}>
                <World
                  {...props}
                  bindActor={bindActor}
                  exited={exited.current}
                />
              </Suspense>
            </Canvas>
          </LabelContext.Provider>
        </ActorContext.Provider>
        <div
          className={`city-label-layer ${props.zoom < 15 ? "is-overview" : ""}`}
        >
          {DISTRICTS.filter((d) => d.id !== "genesis").map((d) => (
            <div
              key={d.id}
              ref={bind("district-" + d.id)}
              className="projected-label"
            >
              <span
                className="district-map-label"
                style={{ color: d.color, opacity: props.zoom < 16 ? 1 : 0 }}
              >
                {d.tag}
              </span>
            </div>
          ))}
          <div ref={bind("exchange")} className="projected-label">
            <div
              className={`exchange-sign ${props.hatching ? "is-hatching" : ""}`}
            >
              <button className="exchange-label" onClick={props.onCreate}>
                <span>✦</span> MEME EXCHANGE{" "}
                <small>
                  {props.hatching
                    ? "AGENT ASSEMBLY IN PROGRESS"
                    : "MINT A MEME. MEET ITS AGENT."}
                </small>
              </button>
              <button
                className="hatch-replay"
                disabled={!!props.hatching}
                onClick={props.onReplayHatch}
              >
                {props.hatching
                  ? "✦ HATCHING A NEW MIND…"
                  : "▷ DEMO THE GENESIS GATE"}
              </button>
            </div>
          </div>
          {props.hatching && (
            <div ref={bind("hatch")} className="projected-label">
              <span className="hatch-name">
                ✦ $
                {
                  props.agents.find((a) => a.id === props.hatching!.agentId)
                    ?.symbol
                }{" "}
                <small>FRESH OUT OF THE GENESIS GATE</small>
              </span>
            </div>
          )}
          <div ref={bind("gate")} className="projected-label">
            <span className={`gate-label ${props.hatching ? "active" : ""}`}>
              ✦ GENESIS GATE
              <small>
                {props.hatching
                  ? "NEW AGENT IN PROGRESS"
                  : "ONE MEME → ONE NEW MIND"}
              </small>
            </span>
          </div>
          {(["cafe", "park", "plaza"] as const).map((id, i) => (
            <div key={id} ref={bind(id)} className="projected-label">
              <span className="place-label">
                {["☕ NIGHT OWL CAFÉ", "♧ MEME PARK", "✦ TOKEN SQUARE"][i]}
              </span>
            </div>
          ))}
          {props.agents.map((a) => (
            <div
              key={a.id}
              ref={bind(a.id)}
              className="projected-label"
              style={{
                opacity: props.hatching?.agentId === a.id ? 0 : 1,
              }}
            >
              <button
                className={`building-label ${props.selected === a.id ? "chosen" : ""}`}
                style={{ "--agent-color": a.color } as React.CSSProperties}
                onClick={() => props.onSelect(a.id)}
              >
                <i />${a.symbol}
                <span>{a.status === "sleeping" ? "☾" : "•"}</span>
              </button>
            </div>
          ))}
          {props.story &&
            props.agents
              .filter((a) =>
                [
                  props.story?.record.agentId,
                  props.story?.record.partnerId,
                ].includes(a.id),
              )
              .map((a) => (
                <div
                  key={a.id + "-story"}
                  ref={bind(a.id + "-story")}
                  className="projected-label"
                >
                  <span className="story-map-bubble">
                    {props.story!.record.agentId === a.id
                      ? props.story!.definition.emoji +
                        " " +
                        props.story!.definition.title
                      : "☕ Neighborhood radio"}
                  </span>
                </div>
              ))}
          {props.agents
            .filter(
              (a) =>
                ![
                  props.story?.record.agentId,
                  props.story?.record.partnerId,
                ].includes(a.id) &&
                (props.streetActivities[a.id] ||
                  props.moment?.kind === "party") &&
                a.status !== "sleeping" &&
                a.id !== props.hatching?.agentId,
            )
            .map((a) => (
              <div
                key={a.id + "-activity"}
                ref={bind(a.id + "-activity")}
                className="projected-label"
              >
                <span
                  className="street-bubble"
                  style={{ "--agent-color": a.color } as React.CSSProperties}
                >
                  {props.moment?.kind === "party"
                    ? "♫ PLAZA PARTY"
                    : props.streetActivities[a.id]?.label}
                </span>
              </div>
            ))}
          {props.agents
            .filter(
              (a) =>
                a.status === "sleeping" && props.hatching?.agentId !== a.id,
            )
            .map((a) => (
              <div
                key={a.id + "-sleep"}
                ref={bind(a.id + "-sleep")}
                className="projected-label"
              >
                <span className="sleep-zzz">z z z</span>
              </div>
            ))}
        </div>
      </div>
    </SceneBoundary>
  );
}
