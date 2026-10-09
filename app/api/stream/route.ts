import { NextResponse } from "next/server";
const API = process.env.MEDIAMTX_API ?? "http://localhost:9997";
const HLS = process.env.MEDIAMTX_HLS ?? "http://localhost:8888";
const PATH_NAME = "drone";

export async function POST(request: Request) {
  const { rtspUrl } = await request.json();
  if (typeof rtspUrl !== "string" || !rtspUrl.startsWith("rtsp://")) {
    return NextResponse.json({ error: "Enter a valid rtsp:// URL" }, { status: 400 });
  }
  try {
    await fetch(`${API}/v3/config/paths/delete/${PATH_NAME}`, { method: "DELETE" }).catch(() => {});
    const res = await fetch(`${API}/v3/config/paths/add/${PATH_NAME}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: rtspUrl }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `MediaMTX: ${await res.text()}` }, { status: 502 });
    }
  } catch {
    return NextResponse.json(
      { error: `Cannot reach MediaMTX at ${API}. Is it running with api: yes?` },
      { status: 502 }
    );
  }
  return NextResponse.json({ hlsUrl: `${HLS}/${PATH_NAME}/index.m3u8` });
}

export async function DELETE() {
  await fetch(`${API}/v3/config/paths/delete/${PATH_NAME}`, { method: "DELETE" }).catch(() => {});
  return NextResponse.json({ ok: true });
}