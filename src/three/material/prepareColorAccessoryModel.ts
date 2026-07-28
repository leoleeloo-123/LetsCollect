import type * as Three from "three";
import type { ToyModelDefinition } from "../../types/toy";
import { assignColorGuineaPigBalloonZones } from "../ColorGuineaPigLab/semanticZones";
import {
  cloneColorBlackCatMaterials,
  prepareColorBlackCatMaskTexture
} from "./createColorBlackCatMaterials";
import {
  cloneColorCoolWolfMaterials,
  prepareColorCoolWolfMaskTexture
} from "./createColorCoolWolfMaterials";
import {
  cloneColorDeerMaterials,
  prepareColorDeerMaskTexture
} from "./createColorDeerMaterials";
import {
  cloneColorDuckMaterials,
  prepareColorDuckMaskTexture
} from "./createColorDuckMaterials";
import {
  cloneColorGuineaPigMaterials,
  prepareColorGuineaPigMaskTexture
} from "./createColorGuineaPigMaterials";
import {
  cloneColorMaskedAccessoryMaterials,
  prepareColorAccessoryMaskTexture,
  type SimpleColorAccessoryProfile
} from "./createColorMaskedAccessoryMaterials";
import {
  cloneColorOwlMaterials,
  prepareColorOwlMaskTexture
} from "./createColorOwlMaterials";
import {
  cloneColorSheepMaterials,
  prepareColorSheepMaskTexture
} from "./createColorSheepMaterials";
import {
  cloneColorSlothMaterials,
  prepareColorSlothMaskTexture
} from "./createColorSlothMaterials";

type ThreeRuntime = typeof import("three");
type Rendering = NonNullable<ToyModelDefinition["rendering"]>;
export type ColorAccessoryRendering = Extract<
  Rendering,
  { mode: "color-accessory-mask" }
>;

export type PreparedColorAccessoryModel = {
  materials: Three.Material[];
  textures: Three.Texture[];
  updateColor: (color: string) => void;
};

export function isColorAccessoryRendering(
  rendering: ToyModelDefinition["rendering"]
): rendering is ColorAccessoryRendering {
  return rendering?.mode === "color-accessory-mask";
}

export async function prepareColorAccessoryModel(
  THREE: ThreeRuntime,
  renderer: Three.WebGLRenderer,
  root: Three.Object3D,
  rendering: ColorAccessoryRendering,
  paletteColor: string
): Promise<PreparedColorAccessoryModel> {
  const loader = new THREE.TextureLoader();
  const [mask, secondaryMask] = await Promise.all([
    loader.loadAsync(rendering.maskUrl),
    rendering.secondaryMaskUrl
      ? loader.loadAsync(rendering.secondaryMaskUrl)
      : Promise.resolve(null)
  ]);
  const textures = secondaryMask ? [mask, secondaryMask] : [mask];
  const accessoryColor = new THREE.Color(paletteColor)
    .multiplyScalar(rendering.colorScale);
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  let materials: Three.Material[];

  if (
    rendering.profile === "racoon-tanghulu"
    || rendering.profile === "hamster-icecream"
    || rendering.profile === "dino-scarf"
    || rendering.profile === "fox-hat"
  ) {
    prepareColorAccessoryMaskTexture(THREE, mask);
    materials = cloneColorMaskedAccessoryMaterials(
      THREE,
      root,
      accessoryColor,
      mask,
      rendering.profile as SimpleColorAccessoryProfile,
      maxAnisotropy
    );
  } else if (rendering.profile === "deer-accessories") {
    prepareColorDeerMaskTexture(THREE, mask);
    materials = cloneColorDeerMaterials(
      THREE,
      root,
      accessoryColor,
      mask,
      maxAnisotropy
    );
  } else if (rendering.profile === "sheep-accessories") {
    prepareColorSheepMaskTexture(THREE, mask);
    materials = cloneColorSheepMaterials(
      THREE,
      root,
      accessoryColor,
      mask,
      maxAnisotropy
    );
  } else if (rendering.profile === "sloth-hat") {
    prepareColorSlothMaskTexture(THREE, mask);
    materials = cloneColorSlothMaterials(
      THREE,
      root,
      accessoryColor,
      mask,
      maxAnisotropy
    );
  } else if (rendering.profile === "owl-academic") {
    prepareColorOwlMaskTexture(THREE, mask);
    materials = cloneColorOwlMaterials(
      THREE,
      root,
      accessoryColor,
      mask,
      maxAnisotropy
    );
  } else if (rendering.profile === "duck-bath" && secondaryMask) {
    prepareColorDuckMaskTexture(THREE, mask);
    prepareColorDuckMaskTexture(THREE, secondaryMask);
    materials = cloneColorDuckMaterials(
      THREE,
      root,
      accessoryColor,
      mask,
      secondaryMask,
      maxAnisotropy
    );
  } else if (rendering.profile === "guinea-pig-balloons") {
    prepareColorGuineaPigMaskTexture(THREE, mask);
    assignColorGuineaPigBalloonZones(THREE, root);
    materials = cloneColorGuineaPigMaterials(
      THREE,
      root,
      accessoryColor,
      mask,
      maxAnisotropy
    );
  } else if (rendering.profile === "black-cat-logo") {
    prepareColorBlackCatMaskTexture(THREE, mask);
    materials = cloneColorBlackCatMaterials(
      THREE,
      root,
      accessoryColor,
      mask,
      maxAnisotropy
    );
  } else if (rendering.profile === "cool-wolf-studs") {
    prepareColorCoolWolfMaskTexture(THREE, mask);
    materials = cloneColorCoolWolfMaterials(
      THREE,
      root,
      accessoryColor,
      mask,
      maxAnisotropy
    );
  } else {
    textures.forEach((texture) => texture.dispose());
    throw new Error(`Unsupported color accessory profile: ${rendering.profile}`);
  }

  return {
    materials,
    textures,
    updateColor(color) {
      accessoryColor.set(color).multiplyScalar(rendering.colorScale);
    }
  };
}