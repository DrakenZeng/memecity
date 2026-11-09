"use client";
import { Compass, Maximize2, MapPin } from "lucide-react";
import { DISTRICTS, MAP_HALF, type MapView } from "@/lib/metropolis";
export default function WorldNavigator({
  view,
  onJump,
  onOverview,
}: {
  view: MapView;
  onJump: (x: number, z: number, zoom?: number) => void;
  onOverview: () => void;
}) {
  const width = Math.min(58, 650 / view.zoom),
    height = Math.min(48, 380 / view.zoom);
  return (
    <section className="world-navigator panel" aria-label="City navigation">
      <div className="navigator-heading">
        <span>
          <Compass size={12} /> CITY MAP <small>9 DISTRICTS</small>
        </span>
        <button
          onClick={onOverview}
          title="See the whole city"
          aria-label="See the whole city"
        >
          <Maximize2 size={12} />
        </button>
      </div>
      <div className="navigator-content">
        <svg
          viewBox={`${-MAP_HALF} ${-MAP_HALF} ${MAP_HALF * 2} ${MAP_HALF * 2}`}
          role="img"
          aria-label="Click the city map to travel to that location"
          onClick={(e) => {
            const bounds = e.currentTarget.getBoundingClientRect();
            onJump(
              ((e.clientX - bounds.left) / bounds.width) * 68 - 34,
              ((e.clientY - bounds.top) / bounds.height) * 68 - 34,
            );
          }}
        >
          <rect x={-34} y={-34} width={68} height={68} fill="#181b2b" rx={2} />
          {DISTRICTS.map((d) => (
            <rect
              key={d.id}
              x={d.rect[0]}
              y={d.rect[1]}
              width={d.rect[2]}
              height={d.rect[3]}
              rx={1}
              fill={d.color}
              fillOpacity={0.18}
              stroke={d.color}
              strokeOpacity={0.22}
              strokeWidth={0.3}
            />
          ))}
          {[-28, -10, 10, 22].map((x) => (
            <path
              key={x}
              d={`M${x},-32V32`}
              stroke="#68627e"
              strokeWidth={0.55}
            />
          ))}
          {[-28, -10, 10, 28].map((z) => (
            <path
              key={z}
              d={`M-32,${z}H32`}
              stroke="#68627e"
              strokeWidth={0.55}
            />
          ))}
          <rect
            x={24}
            y={-13}
            width={9}
            height={45}
            fill="#487a94"
            fillOpacity={0.65}
          />
          <rect x={-2.4} y={-5.1} width={4.8} height={3.8} fill="#e9c68c" />
          <circle cx={0} cy={0} r={1.1} fill="#e9c68c" />
          <rect
            x={view.x - width / 2}
            y={view.z - height / 2}
            width={width}
            height={height}
            rx={0.8}
            fill="#e9c68c"
            fillOpacity={0.06}
            stroke="#e9c68c"
            strokeWidth={0.65}
            strokeDasharray="1.6 1"
          />
          <circle cx={view.x} cy={view.z} r={1.25} fill="#f8e5c1" />
        </svg>
        <div className="navigator-destinations">
          <span>QUICK TRAVEL</span>
          <select
            aria-label="Travel to a district"
            value=""
            onChange={(e) => {
              const d = DISTRICTS.find((d) => d.id === e.target.value);
              if (d) onJump(d.x, d.z, d.zoom);
            }}
          >
            <option value="" disabled>
              Choose district
            </option>
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <button onClick={onOverview}>
            <Maximize2 size={10} /> Whole city
          </button>
          <button onClick={() => onJump(0, 0, 28)}>
            <MapPin size={10} /> Exchange
          </button>
          <small>
            Click map to explore
            <br />
            Scroll to get closer
          </small>
        </div>
      </div>
    </section>
  );
}
