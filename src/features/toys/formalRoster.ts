import type { ToyModelId } from "../../types/toy";

export const formalColorAnimalModelIds = [
  "color-otter",
  "color-bird",
  "color-penguin",
  "color-bunny",
  "color-cat",
  "color-panda",
  "color-bear-singer",
  "color-dog-camera",
  "color-dog-drum",
  "color-seal",
  "color-karpy",
  "color-koala",
  "color-racoon",
  "color-hamster-icecream",
  "color-dino",
  "color-fox",
  "color-deer",
  "color-sheep",
  "color-sloth",
  "color-owl",
  "color-duck",
  "color-guinea-pig",
  "color-black-cat",
  "color-cool-wolf"
] as const satisfies readonly [ToyModelId, ...ToyModelId[]];

export type FormalColorAnimalModelId =
  (typeof formalColorAnimalModelIds)[number];
