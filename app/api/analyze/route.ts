import { NextResponse } from "next/server";
const SAMPLE = [
  { species: "Brassica napus", common_names: ["Rape", "Oil Seed Rape"], family: "Brassicaceae", gbif_id: "3042636" },
  { species: "Sinapis alba", common_names: ["White mustard"], family: "Brassicaceae", gbif_id: "3047621" },
  { species: "Euphorbia virgata", common_names: ["Leafy spurge"], family: "Euphorbiaceae", gbif_id: "7402123" },
  { species: "Artemisia argyi", common_names: ["Chinese mugwort"], family: "Asteraceae", gbif_id: "3120648" },
];

export async function POST(request: Request) {
  const form = await request.formData();
  if (!form.get("image")) {
    return NextResponse.json({ error: "No image" }, { status: 400 });
  }
  await new Promise((r) => setTimeout(r, 400)); 

  const n = 1 + Math.floor(Math.random() * 2);
  const detections = [...SAMPLE]
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
    .map((s) => ({ ...s, score: +(0.1 + Math.random() * 0.7).toFixed(3) }));

  return NextResponse.json({
    detections,
    organ: "habit",
    quota_left: 400 + Math.floor(Math.random() * 90),
  });
}