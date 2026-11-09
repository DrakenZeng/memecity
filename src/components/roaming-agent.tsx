"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Agent } from "@/lib/simulation";
import {
  CITY_NODES,
  PLACES,
  nearestNode,
  streetRoute,
  type StreetActivity,
  type StreetPose,
} from "@/lib/city-life";
import type { StoryRun } from "@/lib/stories";
import StoryEffects from "./story-effects";
import AgentAvatar from "./agent-avatar";
export default function RoamingAgent({
  agent,
  index,
  paused,
  selected,
  onSelect,
  onActivity,
  bindActor,
  danceParty,
  spawnAtGate,
  children,
  story,
}: {
  agent: Agent;
  story?: StoryRun | null;
  index: number;
  paused: boolean;
  selected: boolean;
  onSelect: () => void;
  onActivity: (id: string, activity: StreetActivity | null) => void;
  bindActor: (id: string, actor: THREE.Group | null) => void;
  danceParty: boolean;
  spawnAtGate: boolean;
  children: ReactNode;
}) {
  const actor = useRef<THREE.Group>(null),
    [pose, setPose] = useState<StreetPose>("idle");
  const walk = useRef<{
    node: number;
    path: number[];
    wait: number;
    place: (typeof PLACES)[number] | null;
    time: number;
  } | null>(null);
  if (!walk.current)
    walk.current = {
      node: spawnAtGate ? 1 : nearestNode(agent.position),
      path: [],
      wait: 1 + Math.random() * 3,
      place: null,
      time: 0,
    };
  const [start] = useState(() => {
    const p = CITY_NODES[spawnAtGate ? 1 : nearestNode(agent.position)];
    return spawnAtGate || (agent.position[0] === 0 && agent.position[1] === 1.7)
      ? p
      : [p[0] + ((index % 3) - 1) * 0.3, p[1] + (index % 2) * 0.25];
  });
  useEffect(() => {
    bindActor(agent.id, actor.current);
    return () => bindActor(agent.id, null);
  }, [agent.id, bindActor]);
  useEffect(() => {
    if (agent.status === "sleeping") {
      setPose("sleep");
      onActivity(agent.id, null);
    } else setPose("idle");
  }, [agent.status === "sleeping"]);
  useFrame((_, dt) => {
    if (!actor.current || paused || story || agent.status === "sleeping")
      return;
    if (danceParty) {
      if (pose !== "dance") setPose("dance");
      return;
    }
    const onBridge =
      actor.current.position.x > 22 && actor.current.position.z > 27.4;
    actor.current.position.y +=
      ((onBridge ? 0.8 : 0.64) - actor.current.position.y) *
      Math.min(1, dt * 6);
    const delta = Math.min(dt, 0.05),
      state = walk.current!;
    state.time += delta;
    if (state.path.length) {
      if (pose !== "walking") setPose("walking");
      const next = CITY_NODES[state.path[0]],
        dx = next[0] - actor.current.position.x,
        dz = next[1] - actor.current.position.z,
        distance = Math.hypot(dx, dz),
        speed = 0.7 + (index % 4) * 0.08;
      if (distance <= speed * delta) {
        actor.current.position.x = next[0];
        actor.current.position.z = next[1];
        state.node = state.path.shift()!;
        if (!state.path.length) {
          const place = state.place!;
          setPose(place.pose);
          state.wait = 5 + Math.random() * 7;
          onActivity(agent.id, {
            label: place.label,
            text: place.text,
            pose: place.pose,
          });
          actor.current.rotation.y = 0.3;
        }
      } else {
        actor.current.position.x += (dx / distance) * speed * delta;
        actor.current.position.z += (dz / distance) * speed * delta;
        const turn = Math.atan2(dx, dz);
        actor.current.rotation.y +=
          Math.atan2(
            Math.sin(turn - actor.current.rotation.y),
            Math.cos(turn - actor.current.rotation.y),
          ) * Math.min(1, delta * 8);
      }
    } else {
      state.wait -= delta;
      if (state.wait <= 0) {
        const choices = PLACES.filter((p) => p.node !== state.node);
        state.place = choices[Math.floor(Math.random() * choices.length)];
        state.path = streetRoute(state.node, state.place.node);
        setPose("walking");
        onActivity(agent.id, null);
      }
    }
  });
  return (
    <group
      ref={actor}
      position={[start[0], 0.64, start[1]]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <AgentAvatar
        color={agent.color}
        pose={
          story
            ? story.record.agentId === agent.id
              ? story.definition.pose
              : "coffee"
            : agent.status === "sleeping"
              ? "sleep"
              : pose
        }
        paused={paused}
        selected={selected}
      />
      {story && (
        <StoryEffects
          effect={
            story.record.agentId === agent.id
              ? story.definition.effect
              : "coffee"
          }
          color={agent.color}
          paused={paused}
        />
      )}
      {children}
    </group>
  );
}
