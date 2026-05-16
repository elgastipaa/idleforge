import { REGION_MATERIAL_LABELS, type RegionMaterialId, type ResourceState } from "@/game";

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 10_000) return `${Math.floor(value / 1_000)}k`;
  return Math.floor(value).toLocaleString();
}

export function formatMs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  return `${seconds}s`;
}

export function formatResources(resources: Partial<ResourceState>): string {
  const labels: Record<keyof ResourceState, string> = { gold: "Gold", fragments: "Fragments", renown: "Soul Marks" };
  return (Object.keys(labels) as (keyof ResourceState)[])
    .filter((key) => (resources[key] ?? 0) > 0)
    .map((key) => `${formatNumber(resources[key] ?? 0)} ${labels[key]}`)
    .join(", ");
}

export function formatRegionMaterials(resources: Partial<Record<RegionMaterialId, number>>): string {
  return (Object.keys(REGION_MATERIAL_LABELS) as RegionMaterialId[])
    .filter((key) => (resources[key] ?? 0) > 0)
    .map((key) => `${formatNumber(resources[key] ?? 0)} ${REGION_MATERIAL_LABELS[key]}`)
    .join(", ");
}

export function formatConstructionCost(cost: { resources: Partial<ResourceState>; regionalMaterials: Partial<Record<RegionMaterialId, number>> }): string {
  return [formatResources(cost.resources), formatRegionMaterials(cost.regionalMaterials)].filter(Boolean).join(", ") || "Free";
}
