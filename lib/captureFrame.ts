export function captureFrame(
  video: HTMLVideoElement | null,
  maxWidth = 1280,
  quality = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!video || video.readyState < 2 || !video.videoWidth) {
      return reject(new Error("Video not ready"));
    }
    const scale = Math.min(1, maxWidth / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas not supported"));
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Capture failed"))),
      "image/jpeg",
      quality
    );
  });
}