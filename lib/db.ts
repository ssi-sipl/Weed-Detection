import { prisma } from "./prisma";
import type { Detection } from "./types";

export async function startSession(
  adminName: string,
  rtspUrl: string,
  threshold: number,
  opts: { fieldName?: string; cropName?: string; notes?: string } = {}
) {
  // one admin only: always the same row (id "admin"), name updated if changed
  const admin = await prisma.admin.upsert({
    where: { id: "admin" },
    update: { name: adminName },
    create: { id: "admin", name: adminName },
  });
  return prisma.session.create({
    data: { adminId: admin.id, rtspUrl, threshold, ...opts },
  });
}

export async function saveFrame(
  sessionId: string,
  threshold: number,
  detections: Detection[],
  organ?: string,
  quotaLeft?: number
) {
  return prisma.$transaction(async (tx) => {
    const frame = await tx.frame.create({
      data: { sessionId, threshold, organ, quotaLeft },
    });
    for (const d of detections) {
      const species = await tx.species.upsert({
        where: { scientificName: d.species },
        update: {},
        create: {
          scientificName: d.species,
          family: d.family,
          commonNames: d.common_names,
          gbifId: d.gbif_id,
        },
      });
      await tx.detection.create({
        data: {
          frameId: frame.id,
          speciesId: species.id,
          score: d.score,
          accepted: d.score >= threshold,
        },
      });
    }
    return frame;
  });
}

export async function endSession(sessionId: string, failed = false) {
  return prisma.session.update({
    where: { id: sessionId },
    data: { status: failed ? "FAILED" : "COMPLETED", endedAt: new Date() },
  });
}

export async function getSpeciesSummary(sessionId: string) {
  const groups = await prisma.detection.groupBy({
    by: ["speciesId"],
    where: { accepted: true, frame: { sessionId } },
    _count: { _all: true },
    _avg: { score: true },
  });
  const species = await prisma.species.findMany({
    where: { id: { in: groups.map((g) => g.speciesId) } },
  });
  return groups
    .map((g) => {
      const s = species.find((x) => x.id === g.speciesId)!;
      return {
        species: s.scientificName,
        commonNames: s.commonNames,
        family: s.family,
        kind: s.kind,
        frames: g._count._all,
        avgScore: g._avg.score ?? 0,
      };
    })
    .sort((a, b) => b.frames - a.frames);
}