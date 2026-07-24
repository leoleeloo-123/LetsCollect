import type * as Three from "three";
import {
  getColorBirdAccentPalette,
  getToyModel,
  getToyPalette
} from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";
import { createToyMaterial } from "../material/createToyMaterial";
import {
  cloneColorBirdMaterials,
  prepareColorBirdZoneTexture
} from "../material/createColorBirdMaterials";
import {
  cloneColorTeddyMaterials,
  prepareColorTeddyProtectTexture
} from "../material/createColorTeddyMaterials";
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
import { applyDiamondUnicornTint } from "../material/createDiamondUnicornMaterial";
import { loadToyModel } from "../ToyViewer/runtime";

type ThreeRuntime = typeof import("three");

export type PreparedSeriesToy = {
  root: Three.Object3D;
  modelDefinition: ReturnType<typeof getToyModel>;
  mixer: Three.AnimationMixer | null;
  updateAppearance: (toy: Collectible) => void;
  dispose: () => void;
};

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
    material.roughness = Math.max(material.roughness, 0.88);
    material.envMapIntensity = Math.min(material.envMapIntensity, 0.08);

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
export async function prepareSeriesToy(
  THREE: ThreeRuntime,
  renderer: Three.WebGLRenderer,
  toy: Collectible
): Promise<PreparedSeriesToy> {
  const modelDefinition = getToyModel(toy.modelId);
  const rendering = modelDefinition.rendering;
  const modelUrl = modelDefinition.assets.mobileModelUrl
    ?? modelDefinition.assets.modelUrl;

  const colorBirdZones = rendering?.mode === "color-bird-zones" ? rendering : null;
  const colorTeddyCoat = rendering?.mode === "color-teddy-coat" ? rendering : null;
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

  const [
    gltf,
    colorBirdZoneMap,
    colorTeddyProtectMap,
    colorBunnyProtectMap,
    colorPandaProtectMap,
    colorBearSingerMask,
    colorDogCameraMask,
    colorSealMask,
    colorSealObjectMask
  ] = await Promise.all([
    loadToyModel(modelUrl),
    nullableTexture(THREE, colorBirdZones?.zoneMaskUrl ?? null),
    nullableTexture(THREE, colorTeddyCoat?.protectMaskUrl ?? null),
    nullableTexture(THREE, colorBunnyBag?.protectMaskUrl ?? null),
    nullableTexture(THREE, colorPandaHat?.protectMaskUrl ?? null),
    nullableTexture(THREE, colorBearSingerAfro?.maskUrl ?? null),
    nullableTexture(THREE, colorDogCameraAccessories?.maskUrl ?? null),
    nullableTexture(THREE, colorSealStarfish?.maskUrl ?? null),
    nullableTexture(THREE, colorSealStarfish?.objectMaskUrl ?? null)
  ]);

  if (colorBirdZoneMap) prepareColorBirdZoneTexture(THREE, colorBirdZoneMap);
  if (colorTeddyProtectMap) prepareColorTeddyProtectTexture(THREE, colorTeddyProtectMap);
  if (colorBunnyProtectMap) prepareColorBunnyProtectTexture(THREE, colorBunnyProtectMap);
  if (colorPandaProtectMap) prepareColorPandaProtectTexture(THREE, colorPandaProtectMap);
  if (colorBearSingerMask) prepareColorBearSingerMaskTexture(THREE, colorBearSingerMask);
  if (colorDogCameraMask) prepareColorDogCameraMaskTexture(THREE, colorDogCameraMask);
  if (colorSealMask) prepareColorSealMaskTexture(THREE, colorSealMask);
  if (colorSealObjectMask) {
    prepareColorSealObjectMaskTexture(THREE, colorSealObjectMask);
  }

  const root = gltf.scene;
  root.rotation.y = modelDefinition.viewer.rotationY;
  const materials: Three.Material[] = [];
  const disposableTextures = [
    colorBirdZoneMap,
    colorTeddyProtectMap,
    colorBunnyProtectMap,
    colorPandaProtectMap,
    colorBearSingerMask,
    colorDogCameraMask,
    colorSealMask,
    colorSealObjectMask
  ].filter((texture): texture is Three.Texture => texture !== null);

  let updateAppearance: (nextToy: Collectible) => void;
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  if (colorBirdZones && colorBirdZoneMap) {
    const bodyColor = new THREE.Color();
    const capColor = new THREE.Color();
    materials.push(...cloneColorBirdMaterials(
      THREE,
      root,
      {
        body: bodyColor,
        cap: capColor,
        blush: new THREE.Color(colorBirdZones.blushColor),
        feet: new THREE.Color(colorBirdZones.feetColor)
      },
      colorBirdZoneMap,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      const palette = getToyPalette(nextToy.paletteId);
      const accent = getColorBirdAccentPalette(
        nextToy.paletteId,
        nextToy.appearanceSeed
      );
      bodyColor.set(palette.color).multiplyScalar(colorBirdZones.bodyColorScale);
      capColor.set(accent.color).multiplyScalar(colorBirdZones.capColorScale);
    };
  } else if (colorTeddyCoat && colorTeddyProtectMap) {
    const coatColor = new THREE.Color();
    materials.push(...cloneColorTeddyMaterials(
      THREE,
      root,
      coatColor,
      colorTeddyProtectMap,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      coatColor
        .set(getToyPalette(nextToy.paletteId).color)
        .multiplyScalar(colorTeddyCoat.coatColorScale);
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
        .set(getToyPalette(nextToy.paletteId).color)
        .multiplyScalar(colorBunnyBag.bagColorScale);
    };
  } else if (colorCatYarn) {
    materials.push(...cloneColorCatYarnMaterials(
      THREE,
      root,
      new THREE.Color(getToyPalette(toy.paletteId).color)
        .multiplyScalar(colorCatYarn.yarnColorScale),
      colorCatYarn.materialName,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      const color = new THREE.Color(getToyPalette(nextToy.paletteId).color)
        .multiplyScalar(colorCatYarn.yarnColorScale);
      materials.forEach((material) => {
        if (
          material instanceof THREE.MeshStandardMaterial
          && material.name === colorCatYarn.materialName
        ) {
          material.color.copy(color);
        }
      });
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
        .set(getToyPalette(nextToy.paletteId).color)
        .multiplyScalar(colorPandaHat.hatColorScale);
    };
  } else if (colorOtterLollipop) {
    materials.push(...cloneColorOtterMaterials(
      THREE,
      root,
      new THREE.Color(getToyPalette(toy.paletteId).color)
        .multiplyScalar(colorOtterLollipop.lollipopColorScale),
      colorOtterLollipop.materialName,
      maxAnisotropy
    ));
    updateAppearance = (nextToy) => {
      const color = new THREE.Color(getToyPalette(nextToy.paletteId).color)
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
        .set(getToyPalette(nextToy.paletteId).color)
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
        .set(getToyPalette(nextToy.paletteId).color)
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
        .set(getToyPalette(nextToy.paletteId).color)
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
        .set(getToyPalette(nextToy.paletteId).color)
        .multiplyScalar(colorSealStarfish.colorScale);
    };
  } else {
    const material = createToyMaterial(THREE, toy, { lightweight: true }).material;
    materials.push(material);
    root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.material = material;
      child.castShadow = false;
      child.receiveShadow = false;
    });
    updateAppearance = (nextToy) => {
      const palette = getToyPalette(nextToy.paletteId);
      if (
        nextToy.modelId === "diamond-unicorn"
        || nextToy.modelId === "diamond-dog"
      ) {
        applyDiamondUnicornTint(THREE, material, palette.color);
      } else {
        material.color.set(palette.color);
        material.attenuationColor.set(palette.attenuation);
        material.emissive.set(palette.emissive);
      }
    };
  }

  applyTileMaterialProfile(THREE, materials, disposableTextures);
  updateAppearance(toy);

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
