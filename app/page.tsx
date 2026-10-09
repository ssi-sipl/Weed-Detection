"use client";

import { useEffect, useRef, useState } from "react";
import VideoPlayer from "../components/VideoPlayer";
import Sidebar from "../components/Sidebar";
import ResultsPanel from "../components/ResultPanel";
import { captureFrame } from "../lib/captureFrame";
import type { FrameResult, Status } from "../lib/types";

const CAPTURE_EVERY_SECONDS = 3;

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const busyRef = useRef(false);

  const [admin, setAdmin] = useState("");
  const [rtspUrl, setRtspUrl] = useState("");
  const [threshold, setThreshold] = useState(0.2);
  const [running, setRunning] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<FrameResult[]>([]);
  const [quota, setQuota] = useState<number | null>(null);
  const [error, setError] = useState("");

  // latest values, readable inside the timer without restarting it
  const latest = useRef({ threshold, admin });
  useEffect(() => {
    latest.current = { threshold, admin };
  }, [threshold, admin]);

  async function handleStart() {
    setError("");
    setStatus("connecting");
    setRunning(true);
    try {
      if (rtspUrl.startsWith("rtsp://")) {
        const res = await fetch("/api/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rtspUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not start stream");
        setStreamUrl(data.hlsUrl);
      } else {
        setStreamUrl(rtspUrl); // http(s) HLS or mp4, handy for testing
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start");
      setStatus("error");
      setRunning(false);
    }
  }

  function handleStop() {
    setRunning(false);
    setStreamUrl("");
    setStatus("idle");
    fetch("/api/stream", { method: "DELETE" }).catch(() => {});
  }

  // capture + analyse while running and the video is live
  useEffect(() => {
    if (!running || status !== "live") return;
    const timer = setInterval(async () => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        const blob = await captureFrame(videoRef.current);
        const fd = new FormData();
        fd.append("image", blob, "frame.jpg");
        const res = await fetch("/api/analyze", { method: "POST", body: fd });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();
        setQuota(data.quota_left ?? null);
        setError("");
        setResults((prev) =>
          [
            {
              id: crypto.randomUUID(),
              time: new Date().toLocaleTimeString(),
              admin: latest.current.admin,
              threshold: latest.current.threshold,
              detections: data.detections ?? [],
            },
            ...prev,
          ].slice(0, 200)
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Analysis failed");
      } finally {
        busyRef.current = false;
      }
    }, CAPTURE_EVERY_SECONDS * 1000);
    return () => clearInterval(timer);
  }, [running, status]);

  return (
    <main className="mx-auto flex max-w-[1300px] flex-col gap-4 p-6">

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-xl border border-gray-200 bg-white p-3">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
            <VideoPlayer src={streamUrl} videoRef={videoRef} onStatus={setStatus} />
            {!streamUrl && (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-gray-400">
                No live feed. Enter an RTSP URL and press Start.
              </div>
            )}
          </div>
        </section>

        <Sidebar
          admin={admin}
          setAdmin={setAdmin}
          rtspUrl={rtspUrl}
          setRtspUrl={setRtspUrl}
          threshold={threshold}
          setThreshold={setThreshold}
          running={running}
          status={status}
          quota={quota}
          error={error}
          onStart={handleStart}
          onStop={handleStop}
        />
      </div>

      <ResultsPanel results={results} />
    </main>
  );
}