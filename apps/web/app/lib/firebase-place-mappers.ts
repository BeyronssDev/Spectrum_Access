import type { DocumentData } from "firebase/firestore";
import { sensoryCriteria, type Place, type SensoryCriterion } from "@accessibilitat/shared";

export function mapCriterionAverages(value: unknown): Partial<Record<SensoryCriterion, number>> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const averages: Partial<Record<SensoryCriterion, number>> = {};
  for (const criterion of sensoryCriteria) {
    const score = source[criterion];
    if (typeof score === "number" && Number.isFinite(score)) {
      averages[criterion] = score;
    }
  }

  return Object.keys(averages).length > 0 ? averages : undefined;
}
export function mapPlaceDocument(id: string, data: DocumentData): Place {
  const criterionAverages = mapCriterionAverages(data.criterionAverages);

  return {
    id,
    name: String(data.name ?? ""),
    category: data.category,
    city: String(data.city ?? ""),
    addressOrArea: String(data.addressOrArea ?? ""),
    description: String(data.description ?? ""),
    position: {
      latitude: Number(data.position?.latitude ?? 41.3851),
      longitude: Number(data.position?.longitude ?? 2.1734)
    },
    status: data.status,
    createdBy: String(data.createdBy ?? ""),
    ratingCount: Number(data.ratingCount ?? 0),
    imageCount: Number(data.imageCount ?? 0),
    averageScore: Number(data.averageScore ?? 0),
    ...(criterionAverages ? { criterionAverages } : {}),
    updatedAt: String(data.updatedAt ?? "")
  };
}
