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
  fiberScale?: number;
  fuzzStrength?: number;
  rimStrength?: number;
};

export type ToySurfaceStyleDefinition = {
  id: ToySurfaceStyleId;
  kind: "matte" | "metal" | "plush";
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
    kind: "matte",
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
    kind: "metal",
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
  },
  {
    id: "metal-silver",
    kind: "metal",
    name: "金属银",
    shortName: "金属银",
    description: "仅让原有改色部位呈现冷调银色金属反射，动物主体保持不变。",
    colorOverride: "#b7c0c8",
    glowOverride: "#e2eaf0",
    swatch: "#b7c0c8",
    render: {
      detail: { metalness: 0.97, roughness: 0.14, envMapIntensity: 1.2 },
      compact: { metalness: 0.94, roughness: 0.2, envMapIntensity: 1.05 },
      tile: { metalness: 0.8, roughness: 0.32, envMapIntensity: 0.72 },
      thumbnail: { metalness: 0.88, roughness: 0.26, envMapIntensity: 0.88 }
    }
  },
  {
    id: "metal-rose-gold",
    kind: "metal",
    name: "玫瑰金",
    shortName: "玫瑰金",
    description: "仅让原有改色部位呈现暖粉色金属反射，动物主体保持不变。",
    colorOverride: "#c77d70",
    glowOverride: "#efb1a5",
    swatch: "#c77d70",
    render: {
      detail: { metalness: 0.94, roughness: 0.2, envMapIntensity: 1.12 },
      compact: { metalness: 0.91, roughness: 0.24, envMapIntensity: 0.98 },
      tile: { metalness: 0.77, roughness: 0.35, envMapIntensity: 0.66 },
      thumbnail: { metalness: 0.84, roughness: 0.3, envMapIntensity: 0.8 }
    }
  },
  {
    id: "plush",
    kind: "plush",
    name: "短绒毛绒",
    shortName: "毛绒",
    description: "仅让原有改色部位呈现细密短绒与柔软边缘光，动物主体保持不变。",
    colorOverride: null,
    glowOverride: null,
    swatch: "#d7a58b",
    render: {
      detail: {
        metalness: 0,
        roughness: 0.98,
        envMapIntensity: 0.08,
        fiberScale: 100,
        fuzzStrength: 0.22,
        rimStrength: 0.38
      },
      compact: {
        metalness: 0,
        roughness: 0.97,
        envMapIntensity: 0.08,
        fiberScale: 80,
        fuzzStrength: 0.18,
        rimStrength: 0.32
      },
      tile: {
        metalness: 0,
        roughness: 0.96,
        envMapIntensity: 0.05,
        fiberScale: 58,
        fuzzStrength: 0.14,
        rimStrength: 0.24
      },
      thumbnail: {
        metalness: 0,
        roughness: 0.97,
        envMapIntensity: 0.07,
        fiberScale: 70,
        fuzzStrength: 0.16,
        rimStrength: 0.28
      }
    }
  }
];

export function getToySurfaceStyle(
  id: ToySurfaceStyleId | undefined
): ToySurfaceStyleDefinition {
  return toySurfaceStyles.find((style) => style.id === id)
    ?? toySurfaceStyles[0];
}
