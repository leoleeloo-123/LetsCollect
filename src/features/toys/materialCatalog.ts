import type { MaterialTraits, RarityCode, ToyMaterialId } from "../../types/toy";

export type MaterialDefinition = {
  id: ToyMaterialId;
  name: string;
  probability: number;
  baseQuality: number;
  swatch: string;
  fidelity: "ready" | "approximate";
  traitLabels: Record<keyof MaterialTraits, string>;
};

const genericTraitLabels: Record<keyof MaterialTraits, string> = {
  craftsmanship: "工艺度",
  finish: "完成度",
  purity: "完整度",
  character: "特征度",
  brilliance: "光彩度"
};

export const toyMaterials: MaterialDefinition[] = [
  { id: "plastic", name: "塑料", probability: 30, baseQuality: 15, swatch: "#ef6f86", fidelity: "ready", traitLabels: { craftsmanship: "注塑工艺", finish: "光洁度", purity: "透明度", character: "色彩度", brilliance: "亮片度" } },
  { id: "glass", name: "玻璃", probability: 24, baseQuality: 20, swatch: "#f3fbff", fidelity: "ready", traitLabels: { craftsmanship: "熔制工艺", finish: "平整度", purity: "澄净度", character: "无瑕度", brilliance: "透光度" } },
  { id: "wood", name: "木头", probability: 19, baseQuality: 32, swatch: "#9a5d35", fidelity: "approximate", traitLabels: { craftsmanship: "雕刻工艺", finish: "细腻度", purity: "完整度", character: "纹理度", brilliance: "包浆度" } },
  { id: "iron", name: "铁", probability: 13, baseQuality: 40, swatch: "#555c5f", fidelity: "ready", traitLabels: { craftsmanship: "铸造工艺", finish: "打磨度", purity: "完整度", character: "锤纹度", brilliance: "反射度" } },
  { id: "copper", name: "铜", probability: 7, baseQuality: 51, swatch: "#b66a3c", fidelity: "ready", traitLabels: { craftsmanship: "铸造工艺", finish: "抛光度", purity: "完整度", character: "氧化度", brilliance: "反射度" } },
  { id: "silver", name: "银", probability: 3, baseQuality: 60, swatch: "#c8d0d2", fidelity: "ready", traitLabels: { craftsmanship: "锻造工艺", finish: "抛光度", purity: "纯度", character: "拉丝度", brilliance: "反射度" } },
  { id: "gold", name: "金", probability: 3, baseQuality: 62, swatch: "#d8a72d", fidelity: "ready", traitLabels: { craftsmanship: "锻造工艺", finish: "抛光度", purity: "纯度", character: "色泽度", brilliance: "辉光度" } },
  { id: "crystal", name: "水晶", probability: 1, baseQuality: 82, swatch: "#a8d7ee", fidelity: "ready", traitLabels: { craftsmanship: "琢磨工艺", finish: "通透度", purity: "净度", character: "晶体特征", brilliance: "折射度" } }
];

export const drawableMaterials = toyMaterials.filter((material) => material.probability > 0);

const materialById = new Map(toyMaterials.map((material) => [material.id, material]));

export function getToyMaterial(id: ToyMaterialId) {
  return materialById.get(id) ?? toyMaterials[0];
}

export function getMaterialGrade(rarity: RarityCode) {
  if (rarity === "mythic") return "臻极工艺";
  if (rarity === "legendary") return "大师工艺";
  if (rarity === "epic") return "典藏工艺";
  if (rarity === "rare") return "精选工艺";
  return "标准工艺";
}

export const materialTraitWeights: Record<keyof MaterialTraits, number> = {
  craftsmanship: 0.3,
  finish: 0.22,
  purity: 0.2,
  character: 0.14,
  brilliance: 0.14
};

export { genericTraitLabels };
