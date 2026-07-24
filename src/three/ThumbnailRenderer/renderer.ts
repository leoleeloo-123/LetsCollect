import type * as Three from "three";
import { getColorBirdAccentPalette, getToyModel, getToyPalette, getToyRenderingAssetKey } from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";
import {
  createToyMaterial,
  getCollectibleRenderTraits
} from "../material/createToyMaterial";
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
import {
  cloneColorKarpyMaterials,
  prepareColorKarpyMaskTexture
} from "../material/createColorKarpyMaterials";
import {
  cloneColorKoalaMaterials,
  prepareColorKoalaMaskTexture
} from "../material/createColorKoalaMaterials";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "../ToyViewer/runtime";
import { readThumbnailBlob, writeThumbnailBlob } from "./storage";

const THUMBNAIL_SIZE = 320;
const THUMBNAIL_RENDER_VERSION = 18;
const THUMBNAIL_TARGET_HEIGHT = 3.45;
const THUMBNAIL_MAX_WIDTH = 3.62;
const WEBP_QUALITY = 0.82;

type ThumbnailContext = {
  THREE: typeof import("three");
  renderer: Three.WebGLRenderer;
  environmentTexture: Three.Texture;
};

let contextPromise: Promise<ThumbnailContext> | null = null;
let renderQueue = Promise.resolve();
let contextDisposalTimer = 0;
const pendingThumbnails = new Map<string, Promise<Blob>>();

function getThumbnailKey(toy: Collectible) {
  const model = getToyModel(toy.modelId);
  return [
    "toy-thumbnail",
    THUMBNAIL_RENDER_VERSION,
    model.assets.mobileModelUrl,
    getToyRenderingAssetKey(model),
    toy.appearanceSignature
  ].join(":");
}

async function createContext(): Promise<ThumbnailContext> {
  const [{ THREE }, RoomEnvironment] = await Promise.all([
    loadToyViewerRuntime(),
    loadRoomEnvironment()
  ]);
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(1);
  renderer.setSize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnvironment = new RoomEnvironment();
  const environmentTexture = pmrem.fromScene(roomEnvironment, 0.025).texture;
  roomEnvironment.dispose();
  pmrem.dispose();

  return { THREE, renderer, environmentTexture };
}

function getContext() {
  window.clearTimeout(contextDisposalTimer);
  contextPromise ??= createContext().catch((error) => {
    contextPromise = null;
    throw error;
  });
  return contextPromise;
}

function scheduleContextDisposal() {
  window.clearTimeout(contextDisposalTimer);
  contextDisposalTimer = window.setTimeout(() => {
    const contextToDispose = contextPromise;
    contextPromise = null;
    void contextToDispose?.then(({ renderer, environmentTexture }) => {
      environmentTexture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    });
  }, 1800);
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Unable to encode toy thumbnail")),
      "image/webp",
      WEBP_QUALITY
    );
  });
}

function disposeModel(THREE: typeof import("three"), model: Three.Object3D) {
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) child.geometry.dispose();
  });
}

async function renderThumbnail(toy: Collectible) {
  const { THREE, renderer, environmentTexture } = await getContext();
  const modelDefinition = getToyModel(toy.modelId);
  const palette = getToyPalette(toy.paletteId);
  const materialLightScale = toy.materialId === "glass" ? 0.5 : 1;
  const materialExposure = toy.materialId === "glass" ? 0.82 : 1.12;
  const gltf = await loadToyModel(
    modelDefinition.assets.mobileModelUrl ?? modelDefinition.assets.modelUrl
  );
  const scene = new THREE.Scene();
  scene.environment = environmentTexture;
  renderer.toneMappingExposure = materialExposure;

  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
  camera.position.set(0, 0.58, 7.15);
  camera.lookAt(0, 0.05, 0);

  const colorBirdZones = modelDefinition.rendering?.mode === "color-bird-zones"
    ? modelDefinition.rendering
    : null;
  const colorTeddyCoat = modelDefinition.rendering?.mode === "color-teddy-coat"
    ? modelDefinition.rendering
    : null;
  const colorBunnyBag = modelDefinition.rendering?.mode === "color-bunny-bag"
    ? modelDefinition.rendering
    : null;
  const colorCatYarn = modelDefinition.rendering?.mode === "color-cat-yarn"
    ? modelDefinition.rendering
    : null;
  const colorPandaHat = modelDefinition.rendering?.mode === "color-panda-hat"
    ? modelDefinition.rendering
    : null;
  const colorOtterLollipop = modelDefinition.rendering?.mode === "color-otter-lollipop"
    ? modelDefinition.rendering
    : null;
  const colorBearSingerAfro = modelDefinition.rendering?.mode === "color-bear-singer-afro"
    ? modelDefinition.rendering
    : null;
  const colorDogCameraAccessories = modelDefinition.rendering?.mode === "color-dog-camera-accessories"
    ? modelDefinition.rendering
    : null;
  const colorDogDrum = modelDefinition.rendering?.mode === "color-dog-drum"
    ? modelDefinition.rendering
    : null;
  const colorSealStarfish = modelDefinition.rendering?.mode === "color-seal-starfish"
    ? modelDefinition.rendering
    : null;
  const colorKarpyHat = modelDefinition.rendering?.mode === "color-karpy-hat"
    ? modelDefinition.rendering
    : null;
  const colorKoalaHat = modelDefinition.rendering?.mode === "color-koala-hat"
    ? modelDefinition.rendering
    : null;
  const standardMaterialResult = colorBirdZones
    || colorTeddyCoat
    || colorBunnyBag
    || colorCatYarn
    || colorPandaHat
    || colorOtterLollipop
    || colorBearSingerAfro
    || colorDogCameraAccessories
    || colorDogDrum
    || colorSealStarfish
    || colorKarpyHat
    || colorKoalaHat
    ? null
    : createToyMaterial(THREE, toy);
  const material = standardMaterialResult?.material ?? null;
  const glowColor = standardMaterialResult?.glowColor ?? new THREE.Color(palette.glow);
  const colorBirdZoneMap = colorBirdZones
    ? prepareColorBirdZoneTexture(
        THREE,
        await new THREE.TextureLoader().loadAsync(colorBirdZones.zoneMaskUrl)
      )
    : null;
  const colorTeddyProtectMap = colorTeddyCoat
    ? prepareColorTeddyProtectTexture(
        THREE,
        await new THREE.TextureLoader().loadAsync(colorTeddyCoat.protectMaskUrl)
      )
    : null;
  const colorBunnyProtectMap = colorBunnyBag
    ? prepareColorBunnyProtectTexture(
        THREE,
        await new THREE.TextureLoader().loadAsync(colorBunnyBag.protectMaskUrl)
      )
    : null;
  const colorPandaProtectMap = colorPandaHat
    ? prepareColorPandaProtectTexture(
        THREE,
        await new THREE.TextureLoader().loadAsync(colorPandaHat.protectMaskUrl)
      )
    : null;
  const colorBearSingerMask = colorBearSingerAfro
    ? await new THREE.TextureLoader().loadAsync(colorBearSingerAfro.maskUrl)
    : null;
  if (colorBearSingerMask) {
    prepareColorBearSingerMaskTexture(THREE, colorBearSingerMask);
  }
  const colorDogCameraMask = colorDogCameraAccessories
    ? await new THREE.TextureLoader().loadAsync(colorDogCameraAccessories.maskUrl)
    : null;
  if (colorDogCameraMask) {
    prepareColorDogCameraMaskTexture(THREE, colorDogCameraMask);
  }
  const colorSealMasks = colorSealStarfish
    ? await Promise.all([
        new THREE.TextureLoader().loadAsync(colorSealStarfish.maskUrl),
        new THREE.TextureLoader().loadAsync(colorSealStarfish.objectMaskUrl)
      ])
    : null;
  const colorSealMask = colorSealMasks?.[0] ?? null;
  const colorSealObjectMask = colorSealMasks?.[1] ?? null;
  if (colorSealMask && colorSealObjectMask) {
    prepareColorSealMaskTexture(THREE, colorSealMask);
    prepareColorSealObjectMaskTexture(THREE, colorSealObjectMask);
  }
  const colorKarpyMask = colorKarpyHat
    ? await new THREE.TextureLoader().loadAsync(colorKarpyHat.maskUrl)
    : null;
  if (colorKarpyMask) {
    prepareColorKarpyMaskTexture(THREE, colorKarpyMask);
  }
  const colorKoalaMask = colorKoalaHat
    ? await new THREE.TextureLoader().loadAsync(colorKoalaHat.maskUrl)
    : null;
  if (colorKoalaMask) {
    prepareColorKoalaMaskTexture(THREE, colorKoalaMask);
  }
  const { glow } = getCollectibleRenderTraits(toy);
  const model = gltf.scene;
  const thumbnailRotationOffset = modelDefinition.id === "color-cat" ? -0.3 : 0;
  model.rotation.y = modelDefinition.viewer.rotationY + thumbnailRotationOffset;
  const accentPalette = colorBirdZones
    ? getColorBirdAccentPalette(toy.paletteId, toy.appearanceSeed)
    : null;
  const colorBirdMaterials = colorBirdZones && colorBirdZoneMap && accentPalette
    ? cloneColorBirdMaterials(
        THREE,
        model,
        {
          body: new THREE.Color(palette.color).multiplyScalar(colorBirdZones.bodyColorScale),
          cap: new THREE.Color(accentPalette.color).multiplyScalar(colorBirdZones.capColorScale),
          blush: new THREE.Color(colorBirdZones.blushColor),
          feet: new THREE.Color(colorBirdZones.feetColor)
        },
        colorBirdZoneMap,
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  const colorTeddyMaterials = colorTeddyCoat && colorTeddyProtectMap
    ? cloneColorTeddyMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorTeddyCoat.coatColorScale),
        colorTeddyProtectMap,
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  const colorBunnyMaterials = colorBunnyBag && colorBunnyProtectMap
    ? cloneColorBunnyMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorBunnyBag.bagColorScale),
        colorBunnyProtectMap,
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  const colorCatMaterials = colorCatYarn
    ? cloneColorCatYarnMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorCatYarn.yarnColorScale),
        colorCatYarn.materialName,
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  const colorPandaMaterials = colorPandaHat && colorPandaProtectMap
    ? cloneColorPandaMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorPandaHat.hatColorScale),
        colorPandaProtectMap,
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  const colorOtterMaterials = colorOtterLollipop
    ? cloneColorOtterMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorOtterLollipop.lollipopColorScale),
        colorOtterLollipop.materialName,
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  const colorBearSingerMaterials = colorBearSingerAfro && colorBearSingerMask
    ? cloneColorBearSingerMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorBearSingerAfro.colorScale),
        colorBearSingerMask,
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  const colorDogCameraMaterials = colorDogCameraAccessories && colorDogCameraMask
    ? cloneColorDogCameraMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorDogCameraAccessories.colorScale),
        colorDogCameraMask,
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  const colorDogDrumMaterials = colorDogDrum
    ? cloneColorDogDrumMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorDogDrum.drumColorScale),
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  const colorSealMaterials = colorSealStarfish && colorSealMask && colorSealObjectMask
    ? cloneColorSealMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorSealStarfish.colorScale),
        colorSealMask,
        colorSealObjectMask,
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  const colorKarpyMaterials = colorKarpyHat && colorKarpyMask
    ? cloneColorKarpyMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorKarpyHat.colorScale),
        colorKarpyMask,
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  const colorKoalaMaterials = colorKoalaHat && colorKoalaMask
    ? cloneColorKoalaMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorKoalaHat.hatColorScale),
        colorKoalaMask,
        renderer.capabilities.getMaxAnisotropy()
      )
    : [];
  if (
    !colorBirdZones
    && !colorTeddyCoat
    && !colorBunnyBag
    && !colorCatYarn
    && !colorPandaHat
    && !colorOtterLollipop
    && !colorBearSingerAfro
    && !colorDogCameraAccessories
    && !colorDogDrum
    && !colorSealStarfish
    && !colorKarpyHat
    && !colorKoalaHat
  ) {
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !material) return;
      child.material = material;
      child.castShadow = false;
      child.receiveShadow = false;
    });
  }

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const scaleByHeight = (THUMBNAIL_TARGET_HEIGHT * modelDefinition.viewer.scaleMultiplier)
    / Math.max(size.y, 0.001);
  const scaleByWidth = THUMBNAIL_MAX_WIDTH / Math.max(size.x, 0.001);
  const scaleFactor = Math.min(scaleByHeight, scaleByWidth);
  model.scale.setScalar(scaleFactor);
  model.position.set(
    -center.x * scaleFactor,
    -center.y * scaleFactor + 0.1 + modelDefinition.viewer.yOffset,
    -center.z * scaleFactor
  );
  scene.add(model);

  scene.add(new THREE.HemisphereLight(0xffffff, palette.attenuation, 2.2 * materialLightScale));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.3 * materialLightScale);
  keyLight.position.set(-3.8, 5.2, 4.7);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(glowColor, (2.35 + glow * 1.6) * materialLightScale);
  rimLight.position.set(4.2, 2.8, -3.4);
  scene.add(rimLight);
  const fillLight = new THREE.PointLight(0xffffff, 1.2 * materialLightScale, 10);
  fillLight.position.set(0.6, 1.6, 4.2);
  scene.add(fillLight);
  const underGlow = new THREE.PointLight(glowColor, 1.8 + glow * 3, 5.5);
  underGlow.position.set(0, -1.65, 0.25);
  scene.add(underGlow);


  try {
    renderer.compile(scene, camera);
    renderer.render(scene, camera);
    renderer.render(scene, camera);
    return await canvasToBlob(renderer.domElement);
  } finally {
    disposeModel(THREE, model);
    material?.dispose();
    colorBirdMaterials.forEach((item) => item.dispose());
    colorTeddyMaterials.forEach((item) => item.dispose());
    colorBunnyMaterials.forEach((item) => item.dispose());
    colorCatMaterials.forEach((item) => item.dispose());
    colorPandaMaterials.forEach((item) => item.dispose());
    colorOtterMaterials.forEach((item) => item.dispose());
    colorBearSingerMaterials.forEach((item) => item.dispose());
    colorDogCameraMaterials.forEach((item) => item.dispose());
    colorDogDrumMaterials.forEach((item) => item.dispose());
    colorSealMaterials.forEach((item) => item.dispose());
    colorKarpyMaterials.forEach((item) => item.dispose());
    colorKoalaMaterials.forEach((item) => item.dispose());
    colorBirdZoneMap?.dispose();
    colorTeddyProtectMap?.dispose();
    colorBunnyProtectMap?.dispose();
    colorPandaProtectMap?.dispose();
    colorBearSingerMask?.dispose();
    colorDogCameraMask?.dispose();
    colorSealMask?.dispose();
    colorSealObjectMask?.dispose();
    colorKarpyMask?.dispose();
    colorKoalaMask?.dispose();
    scene.clear();
  }
}

function enqueueRender(toy: Collectible) {
  const task = renderQueue.then(() => renderThumbnail(toy)).finally(scheduleContextDisposal);
  renderQueue = task.then(() => undefined, () => undefined);
  return task;
}

/** Returns a persisted poster, rendering the real Mobile GLB only on cache miss. */
export async function getOrCreateToyThumbnail(toy: Collectible) {
  const key = getThumbnailKey(toy);
  const cached = await readThumbnailBlob(key);
  if (cached) return cached;

  const pending = pendingThumbnails.get(key);
  if (pending) return pending;

  const task = enqueueRender(toy)
    .then(async (blob) => {
      await writeThumbnailBlob(key, blob);
      return blob;
    })
    .finally(() => pendingThumbnails.delete(key));
  pendingThumbnails.set(key, task);
  return task;
}

/** Reads an existing poster without competing with an active live 3D load. */
export function getCachedToyThumbnail(toy: Collectible) {
  return readThumbnailBlob(getThumbnailKey(toy));
}
