"use client";

import { RefObject, useEffect } from "react";
import Hls from "hls.js";
import type { Status } from "../lib/types";

type Props = {
  src: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  onStatus: (s: Status) => void;
};

export default function VideoPlayer({ src, videoRef, onStatus }: Props) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | undefined;
    let retries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (src.endsWith(".m3u8") && Hls.isSupported()) {
      const h = new Hls({ lowLatencyMode: true });
      hls = h;
      h.attachMedia(video);
      h.loadSource(src);
      h.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        onStatus("live");
      });
      h.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retries < 15) {
          retries += 1;
          timer = setTimeout(() => h.loadSource(src), 2000);
        } else {
          onStatus("error");
        }
      });
    } else {
      video.src = src;
      video.play().catch(() => {});
      onStatus("live");
    }

    return () => {
      clearTimeout(timer);
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, videoRef, onStatus]);

  return (
    <video
      ref={videoRef}
      crossOrigin="anonymous"
      muted
      playsInline
      className="block h-full w-full object-contain"
    />
  );
}