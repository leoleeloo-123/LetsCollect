export type ToyStageThemeId =
  | "early-winter"
  | "warm-spring"
  | "soft-green"
  | "soft-lavender";

export type ToyStageThemeDefinition = {
  id: ToyStageThemeId;
  name: string;
  group: "dynamic" | "static";
  background: string;
  swatch: string;
  particle: "snow" | "leaf" | null;
};

export const toyStageThemes: readonly ToyStageThemeDefinition[] = [
  {
    id: "early-winter",
    name: "初冬",
    group: "dynamic",
    background: "#e5f1f6",
    swatch: "#d8ebf3",
    particle: "snow"
  },
  {
    id: "warm-spring",
    name: "暖春",
    group: "dynamic",
    background: "#e5f1e5",
    swatch: "#cfe5d2",
    particle: "leaf"
  },
  {
    id: "soft-green",
    name: "淡绿",
    group: "static",
    background: "#e8f2ed",
    swatch: "#d7e9df",
    particle: null
  },
  {
    id: "soft-lavender",
    name: "淡紫",
    group: "static",
    background: "#eee9f6",
    swatch: "#ddd3ee",
    particle: null
  }
];

const toyStageThemeById = new Map(
  toyStageThemes.map((theme) => [theme.id, theme])
);

export function getToyStageTheme(id: ToyStageThemeId) {
  return toyStageThemeById.get(id) ?? toyStageThemes[0];
}
