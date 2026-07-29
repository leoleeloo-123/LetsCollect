import type { ToySurfaceStyleId } from "../../types/toy";

export type ToySurfaceRenderProfile =
  | "detail"
  | "compact"
  | "tile"
  | "thumbnail";

type ToySurfaceRenderValues = {
  metalness: number;
  roughness: number;
  envMapIntensity: number;
};

export type ToySurfaceStyleDefinition = {
  id: ToySurfaceStyleId;
  name: string;
  shortName: string;
  description: string;
  colorOverride: string | null;
  glowOverride: string | null;
  swatch: string;
  render: Record<ToySurfaceRenderProfile, ToySurfaceRenderValues>;
};

export const toySurfaceStyles: readonly ToySurfaceStyleDefinition[] = [
  {
    id: "matte",
    name: "柔雾树脂",
    shortName: "柔雾",
    description: "保留当前柔和、低反射的收藏玩偶基线。",
    colorOverride: null,
    glowOverride: null,
    swatch: "#d7a27f",
    render: {
      detail: { metalness: 0, roughness: 1, envMapIntensity: 0.12 },
      compact: { metalness: 0, roughness: 1, envMapIntensity: 0.12 },
      tile: { metalness: 0, roughness: 1, envMapIntensity: 0.05 },
      thumbnail: { metalness: 0, roughness: 1, envMapIntensity: 0.12 }
    }
  },
  {
    id: "metal-gold",
    name: "金属金",
    shortName: "金属金",
    description: "仅让原有改色部位呈现金色金属反射，动物主体保持不变。",
    colorOverride: "#d8a72d",
    glowOverride: "#f1c65f",
    swatch: "#d8a72d",
    render: {
      detail: { metalness: 0.95, roughness: 0.18, envMapIntensity: 1.15 },
      compact: { metalness: 0.92, roughness: 0.22, envMapIntensity: 1 },
      tile: { metalness: 0.78, roughness: 0.34, envMapIntensity: 0.68 },
      thumbnail: { metalness: 0.86, roughness: 0.28, envMapIntensity: 0.82 }
    }
  }
];

export function getToySurfaceStyle(
  id: ToySurfaceStyleId | undefined
): ToySurfaceStyleDefinition {
  return toySurfaceStyles.find((style) => style.id === id)
    ?? toySurfaceStyles[0];
}
