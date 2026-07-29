import type * as Three from "three";
import {
  getToyModel,
  getToyPalette
} from "../../features/toys/catalog";
import { getToySurfaceStyle } from "../../features/toys/surfaceStyles";
import type { Collectible } from "../../types/toy";
import { createToyMaterial } from "../material/createToyMaterial";
import {
  applyToySurfaceStyle,
  type ToySurfaceCoverage
} from "../material/applyToySurfaceStyle";
import {
  cloneColorBunnyMaterials,
  prepareColorBunnyProtectTexture
} from "../material/createColorBunnyMaterials";
import { cloneColorCatYarnMaterials } from "../material/createColorCatYarnMaterials";
import {
  cloneColorPandaMaterials,
  prepareColorPandaProtectTexture
} from "../material/createColorPandaMaterials";
import { cloneColorOtterMaterials } from "../material/createColorOtterMaterials";
import {
  cloneColorBearSingerMaterials,
  prepareColorBearSingerMaskTexture
} from "../material/createColorBearSingerMaterials";
import {
  cloneColorDogCameraMaterials,
  prepareColorDogCameraMaskTexture
} from "../material/createColorDogCameraMaterials";
import { cloneColorDogDrumMaterials } from "../material/createColorDogDrumMaterials";
import {
  cloneColorSealMaterials,
  prepareColorSealMaskTexture,
  prepareColorSealObjectMaskTexture
} from "../material/createColorSealMaterials";
import {
  cloneColorKarpyMaterials,
  prepareColorKarpyMaskTexture
} from "../material/createColorKarpyMaterials";
import {
  cloneColorKoalaMaterials,
  prepareColorKoalaMaskTexture
} from "../material/createColorKoalaMaterials";
import {
  isColorAccessoryRendering,
  prepareColorAccessoryModel
} from "../material/prepareColorAccessoryModel";
import { loadToyModel } from "../ToyViewer/runtime";

type ThreeRuntime = typeof import("three");

export type ToyAppearanceProfile =
  | "detail"
  | "compact"
  | "tile"
  | "thumbnail";

export type PrepareToyAppearanceOptions = {
  profile: ToyAppearanceProfile;
  modelUrl?: string;
  onProgress?: (loaded: number, total: number) => void;
};

export type PreparedToyAppearance = {
  root: Three.Object3D;
  modelDefinition: ReturnType<typeof getToyModel>;
  mixer: Three.AnimationMixer | null;
  primaryMaterial: Three.MeshPhysicalMaterial | null;
  glowColor: Three.Color;
  updateAppearance: (toy: Collectible) => void;
  dispose: () => void;
};

function getAppearanceColor(toy: Collectible) {
  const surface = getToySurfaceStyle(toy.surfaceStyleId);
  return surface.colorOverride ?? getToyPalette(toy.paletteId).color;
}

function getAppearanceGlow(toy: Collectible) {
  const surface = getToySurfaceStyle(toy.surfaceStyleId);
  return surface.glowOverride ?? getToyPalette(toy.paletteId).glow;
}

function getSurfaceCoverage(
  rendering: ReturnType<typeof getToyModel>["rendering"]
): ToySurfaceCoverage {
  if (!rendering) return { kind: "full-material" };

  switch (rendering.mode) {
    case "color-bunny-bag":
      return { kind: "shader-mask", expression: "bagDetail" };
    case "color-cat-yarn":
      return { kind: "full-material", materialName: rendering.materialName };
    case "color-panda-hat":
      return { kind: "shader-mask", expression: "hatDetail" };
    case "color-otter-lollipop":
      return { kind: "full-material", materialName: rendering.materialName };
    case "color-bear-singer-afro":
      return { kind: "shader-mask", expression: "afroDetail" };
    case "color-dog-camera-accessories":
      return { kind: "shader-mask", expression: "accessoryDetail" };
    case "color-dog-drum":
      return { kind: "shader-mask", expression: "drumMask * 0.94" };
    case "color-seal-starfish":
      return {
        kind: "shader-mask",
        expression: "starfishMask * (1.0 - faceDetailMask)"
      };
    case "color-karpy-hat":
      return { kind: "shader-mask", expression: "hatDetail" };
    case "color-koala-hat":
      return { kind: "shader-mask", expression: "hatRegion" };
    case "color-accessory-mask":
      switch (rendering.profile) {
        case "bird-crown":
          return { kind: "shader-mask", expression: "crownDetail" };
        case "penguin-accessories":
          return { kind: "shader-mask", expression: "accessoryDetail" };
        case "sloth-hat":
          return { kind: "shader-mask", expression: "hatDetail" };
        case "owl-academic":
          return { kind: "shader-mask", expression: "academicDetail" };
        case "duck-bath":
          return { kind: "shader-mask", expression: "bathDetail" };
        case "guinea-pig-balloons":
          return { kind: "shader-mask", expression: "balloonWeight" };
        case "black-cat-logo":
          return { kind: "shader-mask", expression: "logoDetail" };
        case "cool-wolf-studs":
          return { kind: "shader-mask", expression: "studDetail" };
        default:
          return { kind: "shader-mask", expression: "accessoryDetail" };
      }
  }
}
function nullableTexture(
  THREE: ThreeRuntime,
  url: string | null
): Promise<Three.Texture | null> {
  return url
    ? new THREE.TextureLoader().loadAsync(url)
    : Promise.resolve(null);
}

function applyTileMaterialProfile(
  THREE: ThreeRuntime,
  materials: Three.Material[],
  disposableTextures: Three.Texture[]
) {
  const textureCopies = new Map<Three.Texture, Three.Texture>();

  materials.forEach((material) => {
    if (!(material instanceof THREE.MeshStandardMaterial)) return;
    material.normalMap = null;
    material.metalness = 0;
    material.roughness = 1;
    material.envMapIntensity = Math.min(material.envMapIntensity, 0.05);
    material.metalnessMap = null;
    material.roughnessMap = null;

    if (!material.map) {
      material.needsUpdate = true;
      return;
    }

    let tileMap = textureCopies.get(material.map);
    if (!tileMap) {
      tileMap = material.map.clone();
      tileMap.generateMipmaps = false;
      tileMap.minFilter = THREE.LinearFilter;
      tileMap.magFilter = THREE.LinearFilter;
      tileMap.anisotropy = 1;
      tileMap.needsUpdate = true;
      textureCopies.set(material.map, tileMap);
      disposableTextures.push(tileMap);
    }

    material.map = tileMap;
    material.needsUpdate = true;
  });
}

/**
 * Loads one mobile GLB and prepares its collectible-specific materials for the
 * shared series canvas. Color bindings update in place, so palette changes do
 * not reload geometry or recreate the renderer.
 */
export async function prepareToyAppearance(
  THREE: ThreeRuntime,
  renderer: Three.WebGLRenderer,
  toy: Collectible,
  options: PrepareToyAppearanceOptions
): Promise<PreparedToyAppearance> {
  const modelDefinition = getToyModel(toy.modelId);
  const rendering = modelDefinition.rendering;
  const modelUrl = options.modelUrl
    ?? modelDefinition.assets.mobileModelUrl
    ?? modelDefinition.assets.modelUrl;

  const colorBunnyBag = rendering?.mode === "color-bunny-bag" ? rendering : null;
  const colorCatYarn = rendering?.mode === "color-cat-yarn" ? rendering : null;
  const colorPandaHat = rendering?.mode === "color-panda-hat" ? rendering : null;
  const colorOtterLollipop = rendering?.mode === "color-otter-lollipop" ? rendering : null;
  const colorBearSingerAfro = rendering?.mode === "color-bear-singer-afro" ? rendering : null;
  const colorDogCameraAccessories = rendering?.mode === "color-dog-camera-accessories"
    ? rendering
    : null;
  const colorDogDrum = rendering?.mode === "color-dog-drum" ? rendering : null;
  const colorSealStarfish = rendering?.mode === "color-seal-starfish" ? rendering : null;
  const colorKarpyHat = rendering?.mode === "color-karpy-hat" ? rendering : null;
  const colorKoalaHat = rendering?.mode === "color-koala-hat" ? rendering : null;
  const colorAccessoryRendering = isColorAccessoryRendering(rendering)
    ? rendering
    : null;

  const [
    gltf,
    colorBunnyProtectMap,
    colorPandaProtectMap,
    colorBearSingerMask,
    colorDogCameraMask,
    colorSealMask,
    colorSealObjectMask,
    colorKarpyMask,
    colorKoalaMask
  ] = await Promise.all([
    loadToyModel(modelUrl, options.onProgress),
    nullableTexture(THREE, colorBunnyBag?.protectMaskUrl ?? null),
    nullableTexture(THREE, colorPandaHat?.protectMaskUrl ?? null),
    nullableTexture(THREE, colorBearSingerAfro?.maskUrl ?? null),
    nullableTexture(THREE, colorDogCameraAccessories?.maskUrl ?? null),
    nullableTexture(THREE, colorSealStarfish?.maskUrl ?? null),
    nullableTexture(THREE, colorSealStarfish?.objectMaskUrl ?? null),
    nullableTexture(THREE, colorKarpyHat?.maskUrl ?? null),
    nullableTexture(THREE, colorKoalaHat?.maskUrl ?? null)
  ]);

  if (colorBunnyProtectMap) prepareColorBunnyProtectTexture(THREE, colorBunnyProtectMap);
  if (colorPandaProtectMap) prepareColorPandaProtectTexture(THREE, colorPandaProtectMap);
  if (colorBearSingerMask) prepareColorBearSingerMaskTexture(THREE, colorBearSingerMask);
  if (colorDogCameraMask) prepareColorDogCameraMaskTexture(THREE, colorDogCameraMask);
  if (colorSealMask) prepareColorSealMaskTexture(THREE, colorSealMask);
  if (colorSealObjectMask) {
    prepareColorSealObjectMaskTexture(THREE, colorSealObjectMask);
  }
  if (colorKarpyMask) prepareColorKarpyMaskTexture(THREE, colorKarpyMask);
  if (colorKoalaMask) prepareColorKoalaMaskTexture(THREE, colorKoalaMask);

  const root = gltf.scene;
  root.rotation.y = modelDefinition.viewer.rotationY;
  const colorAccessory = colorAccessoryRendering
    ? await prepareColorAccessoryModel(
        THREE,
        renderer,
        root,
        colorAccessoryRendering,
        getAppearanceColor(toy)
      )
    : null;
  const materials: Three.Material[] = [];
  const disposableTextures = [
    colorBunnyProtectMap,
    colorPandaProtectMap,
    colorBearSingerMask,
    colorDogCameraMask,
    colorSealMask,
    colorSealObjectMask,
    colorKarpyMask,
    colorKoalaMask,
    ...(colorAccessory?.textures ?? [])
  ].filter((texture): texture is Three.Texture => texture !== null);

  let updateAppearance: (nextToy: Collectible) => void;
  let primaryMaterial: Three.MeshPhysicalMaterial | null = null;
  const glowColor = new THREE.Color(getAppearanceGlow(toy));
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  if (colorAccessory) {
    materials.push(...colorAccessory.materials);
    updateAppearance = (nextToy) => {
      colorAccessory.updateColor(getAppearanceColor(nextToy));
    };
  } else if (colorBunnyBag && colorBunnyProtectMap) {
    const bagColor = new THREE.Color();
    materials.push(...cloneColorBunnyMaterials(
      THREE,
      root,
      bagColor,
      colorBunnyProtectMap,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      bagColor
        .set(getAppearanceColor(nextToy))
        .multiplyScalar(colorBunnyBag.bagColorScale);
    };
  } else if (colorCatYarn) {
    const yarnColor = new THREE.Color();
    materials.push(...cloneColorCatYarnMaterials(
      THREE,
      root,
      yarnColor,
      colorCatYarn.materialName,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      yarnColor
        .set(getAppearanceColor(nextToy))
        .multiplyScalar(colorCatYarn.yarnColorScale);
    };
  } else if (colorPandaHat && colorPandaProtectMap) {
    const hatColor = new THREE.Color();
    materials.push(...cloneColorPandaMaterials(
      THREE,
      root,
      hatColor,
      colorPandaProtectMap,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      hatColor
        .set(getAppearanceColor(nextToy))
        .multiplyScalar(colorPandaHat.hatColorScale);
    };
  } else if (colorOtterLollipop) {
    materials.push(...cloneColorOtterMaterials(
      THREE,
      root,
      new THREE.Color(getAppearanceColor(toy))
        .multiplyScalar(colorOtterLollipop.lollipopColorScale),
      colorOtterLollipop.materialName,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      const color = new THREE.Color(getAppearanceColor(nextToy))
        .multiplyScalar(colorOtterLollipop.lollipopColorScale);
      materials.forEach((material) => {
        if (
          material instanceof THREE.MeshStandardMaterial
          && material.name === colorOtterLollipop.materialName
        ) {
          material.color.copy(color);
        }
      });
    };
  } else if (colorBearSingerAfro && colorBearSingerMask) {
    const afroColor = new THREE.Color();
    materials.push(...cloneColorBearSingerMaterials(
      THREE,
      root,
      afroColor,
      colorBearSingerMask,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      afroColor
        .set(getAppearanceColor(nextToy))
        .multiplyScalar(colorBearSingerAfro.colorScale);
    };
  } else if (colorDogCameraAccessories && colorDogCameraMask) {
    const accessoryColor = new THREE.Color();
    materials.push(...cloneColorDogCameraMaterials(
      THREE,
      root,
      accessoryColor,
      colorDogCameraMask,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      accessoryColor
        .set(getAppearanceColor(nextToy))
        .multiplyScalar(colorDogCameraAccessories.colorScale);
    };
  } else if (colorDogDrum) {
    const drumColor = new THREE.Color();
    materials.push(...cloneColorDogDrumMaterials(
      THREE,
      root,
      drumColor,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      drumColor
        .set(getAppearanceColor(nextToy))
        .multiplyScalar(colorDogDrum.drumColorScale);
    };
  } else if (colorSealStarfish && colorSealMask && colorSealObjectMask) {
    const starfishColor = new THREE.Color();
    materials.push(...cloneColorSealMaterials(
      THREE,
      root,
      starfishColor,
      colorSealMask,
      colorSealObjectMask,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      starfishColor
        .set(getAppearanceColor(nextToy))
        .multiplyScalar(colorSealStarfish.colorScale);
    };
  } else if (colorKarpyHat && colorKarpyMask) {
    const hatColor = new THREE.Color();
    materials.push(...cloneColorKarpyMaterials(
      THREE,
      root,
      hatColor,
      colorKarpyMask,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      hatColor
        .set(getAppearanceColor(nextToy))
        .multiplyScalar(colorKarpyHat.colorScale);
    };
  } else if (colorKoalaHat && colorKoalaMask) {
    const hatColor = new THREE.Color();
    materials.push(...cloneColorKoalaMaterials(
      THREE,
      root,
      hatColor,
      colorKoalaMask,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      hatColor
        .set(getAppearanceColor(nextToy))
        .multiplyScalar(colorKoalaHat.hatColorScale);
    };
  } else {
    const materialResult = createToyMaterial(THREE, toy, {
      lightweight: options.profile !== "detail"
    });
    const material = materialResult.material;
    primaryMaterial = material;
    glowColor.copy(materialResult.glowColor);
    materials.push(material);
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.material = material;
      child.castShadow = false;
      child.receiveShadow = false;
    });
    updateAppearance = (nextToy) => {
      const palette = getToyPalette(nextToy.paletteId);
      material.color.set(getAppearanceColor(nextToy));
      material.attenuationColor.set(palette.attenuation);
      material.emissive.set(palette.emissive);
    };
  }

  if (options.profile === "tile") {
    applyTileMaterialProfile(THREE, materials, disposableTextures);
  }
  updateAppearance(toy);
  applyToySurfaceStyle(
    THREE,
    materials,
    toy.surfaceStyleId,
    options.profile,
    getSurfaceCoverage(rendering)
  );

  let mixer: Three.AnimationMixer | null = null;
  if (gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(root);
    gltf.animations.forEach((clip) => mixer?.clipAction(clip).play());
  }

  let disposed = false;
  return {
    root,
    modelDefinition,
    mixer,
    primaryMaterial,
    glowColor,
    updateAppearance,
    dispose() {
      if (disposed) return;
      disposed = true;
      mixer?.stopAllAction();
      root.traverse((child) => {
        if (child instanceof THREE.Mesh) child.geometry.dispose();
      });
      materials.forEach((material) => material.dispose());
      disposableTextures.forEach((texture) => texture.dispose());
    }
  };
}
