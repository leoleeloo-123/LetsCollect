import { localSurfaceRecords } from "../../data/asset-registry/localTables";
import type { SurfaceRenderValuesRecord } from "../../data/asset-registry/types";
import type { ToySurfaceStyleId } from "../../types/toy";

export type ToySurfaceRenderProfile =
  | "detail"
  | "compact"
  | "tile"
  | "thumbnail";

export type ToySurfaceStyleDefinition = {
  id: ToySurfaceStyleId;
  kind: "matte" | "metal";
  name: string;
  shortName: string;
  description: string;
  colorOverride: string | null;
  glowOverride: string | null;
  swatch: string;
  render: Record<ToySurfaceRenderProfile, SurfaceRenderValuesRecord>;
};

const knownSurfaceStyleIds = new Set<ToySurfaceStyleId>([
  "matte",
  "metal-gold",
  "metal-silver",
  "metal-rose-gold"
]);

const sortedSurfaceRecords = [...localSurfaceRecords].sort(
  (left, right) => left.sortOrder - right.sortOrder
);

for (const surface of sortedSurfaceRecords) {
  if (!knownSurfaceStyleIds.has(surface.id as ToySurfaceStyleId)) {
    throw new Error(`Unknown toy surface ID in Registry: ${surface.id}`);
  }
}

export const toySurfaceStyles: readonly ToySurfaceStyleDefinition[] =
  sortedSurfaceRecords
    .filter((surface) => surface.enabled !== false)
    .map((surface) => ({
      id: surface.id as ToySurfaceStyleId,
      kind: surface.kind,
      name: surface.name,
      shortName: surface.shortName,
      description: surface.description,
      colorOverride: surface.colorOverride,
      glowOverride: surface.glowOverride,
      swatch: surface.swatch,
      render: surface.render
    }));

if (toySurfaceStyles.length === 0) {
  throw new Error("Asset Registry must expose at least one active toy surface.");
}

const toySurfaceStyleById = new Map(
  toySurfaceStyles.map((surface) => [surface.id, surface])
);

export function getToySurfaceStyle(
  id: ToySurfaceStyleId | undefined
): ToySurfaceStyleDefinition {
  return (id ? toySurfaceStyleById.get(id) : null)
    ?? toySurfaceStyleById.get("matte")
    ?? toySurfaceStyles[0];
}
