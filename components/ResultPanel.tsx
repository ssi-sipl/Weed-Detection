"use client";

import type { FrameResult } from "../lib/types";

type Row = {
  key: string;
  time: string;
  plant: string;
  common: string;
  score: number | null;
  threshold: number;
  ok: boolean;
};

export default function ResultsPanel({ results }: { results: FrameResult[] }) {
  const rows: Row[] = [];
  for (const r of results) {
    if (r.detections.length === 0) {
      rows.push({
        key: r.id,
        time: r.time,
        plant: "No plant found",
        common: "",
        score: null,
        threshold: r.threshold,
        ok: false,
      });
      continue;
    }
    r.detections.forEach((d, i) =>
      rows.push({
        key: `${r.id}-${i}`,
        time: r.time,
        plant: d.species,
        common: d.common_names.slice(0, 2).join(", "),
        score: d.score,
        threshold: r.threshold,
        ok: d.score >= r.threshold,
      })
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Results</h2>
        <span className="text-sm text-gray-500">{results.length} frames analysed</span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">
          No results yet. Press Start to begin analysis.
        </p>
      ) : (
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white text-xs text-gray-500">
              <tr>
                <th className="p-2">Time</th>
                <th className="p-2">Plant name</th>
                <th className="p-2">Confidence</th>
                <th className="p-2">Threshold</th>
                <th className="p-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 60).map((r) => (
                <tr
                  key={r.key}
                  className={`border-t border-gray-100 ${r.ok ? "" : "opacity-60"}`}
                >
                  <td className="p-2">{r.time}</td>
                  <td className="p-2">
                    <div className="font-semibold">{r.plant}</div>
                    {r.common && <div className="text-xs text-gray-500">{r.common}</div>}
                  </td>
                  <td className="p-2">
                    {r.score === null ? (
                      "-"
                    ) : (
                      <div className="relative h-5 w-36 overflow-hidden rounded bg-gray-100">
                        <div
                          className="absolute inset-y-0 left-0 bg-green-200"
                          style={{ width: `${r.score * 100}%` }}
                        />
                        <span className="relative pl-2 text-xs leading-5">
                          {(r.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-2">{r.threshold.toFixed(2)}</td>
                  <td className="p-2">
                    {r.score === null ? (
                      "-"
                    ) : (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs text-white ${
                          r.ok ? "bg-green-600" : "bg-amber-500"
                        }`}
                      >
                        {r.ok ? "Detected" : "Below threshold"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}