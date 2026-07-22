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
import {
  cloneColorCatMaterials,
  prepareColorCatProtectTexture
} from "../material/createColorCatMaterials";
import {
  cloneColorPandaMaterials,
  prepareColorPandaProtectTexture
} from "../material/createColorPandaMaterials";
import { cloneColorOtterMaterials } from "../material/createColorOtterMaterials";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "../ToyViewer/runtime";
import { readThumbnailBlob, writeThumbnailBlob } from "./storage";

const THUMBNAIL_SIZE = 320;
const THUMBNAIL_RENDER_VERSION = 13;
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
  const colorCatCoat = modelDefinition.rendering?.mode === "color-cat-coat"
    ? modelDefinition.rendering
    : null;
  const colorPandaHat = modelDefinition.rendering?.mode === "color-panda-hat"
    ? modelDefinition.rendering
    : null;
  const colorOtterLollipop = modelDefinition.rendering?.mode === "color-otter-lollipop"
    ? modelDefinition.rendering
    : null;
  const standardMaterialResult = colorBirdZones || colorTeddyCoat || colorBunnyBag || colorCatCoat || colorPandaHat || colorOtterLollipop
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
  const colorCatProtectMap = colorCatCoat
    ? prepareColorCatProtectTexture(
        THREE,
        await new THREE.TextureLoader().loadAsync(colorCatCoat.protectMaskUrl)
      )
    : null;
  const colorPandaProtectMap = colorPandaHat
    ? prepareColorPandaProtectTexture(
        THREE,
        await new THREE.TextureLoader().loadAsync(colorPandaHat.protectMaskUrl)
      )
    : null;
  const { glow } = getCollectibleRenderTraits(toy);
  const model = gltf.scene;
  model.rotation.y = modelDefinition.viewer.rotationY - 0.08;
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
  const colorCatMaterials = colorCatCoat && colorCatProtectMap
    ? cloneColorCatMaterials(
        THREE,
        model,
        new THREE.Color(palette.color).multiplyScalar(colorCatCoat.coatColorScale),
        colorCatProtectMap,
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
  if (!colorBirdZones && !colorTeddyCoat && !colorBunnyBag && !colorCatCoat && !colorPandaHat && !colorOtterLollipop) {
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
  const scaleFactor = (3.45 * modelDefinition.viewer.scaleMultiplier) / Math.max(size.y, 0.001);
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
    colorBirdZoneMap?.dispose();
    colorTeddyProtectMap?.dispose();
    colorBunnyProtectMap?.dispose();
    colorCatProtectMap?.dispose();
    colorPandaProtectMap?.dispose();
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
