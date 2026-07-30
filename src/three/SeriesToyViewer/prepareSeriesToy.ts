import type * as Three from "three";
import type { Collectible } from "../../types/toy";
import {
  prepareToyAppearance,
  type PreparedToyAppearance
} from "../appearance/prepareToyAppearance";

type ThreeRuntime = typeof import("three");

export type PreparedSeriesToy = PreparedToyAppearance;

export function prepareSeriesToy(
  THREE: ThreeRuntime,
  renderer: Three.WebGLRenderer,
  toy: Collectible
) {
  return prepareToyAppearance(THREE, renderer, toy, { profile: "tile" });
}
