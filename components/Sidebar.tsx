"use client";

import type { Status } from "../lib/types";

type Props = {
  admin: string;
  setAdmin: (v: string) => void;
  rtspUrl: string;
  setRtspUrl: (v: string) => void;
  threshold: number;
  setThreshold: (v: number) => void;
  running: boolean;
  status: Status;
  quota: number | null;
  error: string;
  onStart: () => void;
  onStop: () => void;
};

const statusStyle: Record<Status, string> = {
  idle: "bg-gray-200 text-gray-700",
  connecting: "bg-amber-500 text-white",
  live: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
};

export default function Sidebar(p: Props) {
  const inputCls =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:bg-gray-100";

  return (
    <aside className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Control panel</h2>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        Admin name
        <input
          className={inputCls}
          value={p.admin}
          onChange={(e) => p.setAdmin(e.target.value)}
          placeholder="e.g. Rahul"
          disabled={p.running}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        RTSP URL
        <input
          className={inputCls}
          value={p.rtspUrl}
          onChange={(e) => p.setRtspUrl(e.target.value)}
          placeholder="rtsp://192.168.1.10:554/live"
          disabled={p.running}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        <span className="flex justify-between">
          Threshold
          <strong className="text-gray-900">{p.threshold.toFixed(2)}</strong>
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={p.threshold}
          onChange={(e) => p.setThreshold(Number(e.target.value))}
          className="w-full accent-green-600"
        />
        <span className="flex justify-between text-xs text-gray-500">
          <span>0 (accept all)</span>
          <span>1 (strict)</span>
        </span>
      </label>

      {p.running ? (
        <button
          onClick={p.onStop}
          className="rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
        >
          Stop
        </button>
      ) : (
        <button
          onClick={p.onStart}
          disabled={!p.rtspUrl.trim()}
          className="rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start
        </button>
      )}

      <div className="flex flex-col gap-1 text-sm">
        <div>
          Status:{" "}
          <span className={`rounded-full px-2.5 py-0.5 text-xs ${statusStyle[p.status]}`}>
            {p.status}
          </span>
        </div>
        {p.quota !== null && (
          <div className="text-gray-500">PlantNet requests left: {p.quota}</div>
        )}
        {p.error && <div className="text-red-600">{p.error}</div>}
      </div>
    </aside>
  );
}