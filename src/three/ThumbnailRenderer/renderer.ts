import type * as Three from "three";
import {
  getToyModel,
  getToyPalette,
  getToyRenderingAssetKey
} from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";
import {
  prepareToyAppearance,
  type PreparedToyAppearance
} from "../appearance/prepareToyAppearance";
import { getCollectibleRenderTraits } from "../material/createToyMaterial";
import {
  loadRoomEnvironment,
  loadToyViewerRuntime
} from "../ToyViewer/runtime";
import { readThumbnailBlob, writeThumbnailBlob } from "./storage";

const THUMBNAIL_SIZE = 320;
const THUMBNAIL_RENDER_VERSION = 21;
const THUMBNAIL_TARGET_HEIGHT = 3.45;
const THUMBNAIL_MAX_WIDTH = 3.62;
const WEBP_QUALITY = 0.82;
const MIN_VISIBLE_PIXEL_COUNT = 512;

type ThumbnailContext = {
  THREE: typeof import("three");
  renderer: Three.WebGLRenderer;
  environmentTexture: Three.Texture;
};

let contextPromise: Promise<ThumbnailContext> | null = null;
let renderQueue = Promise.resolve();
let contextDisposalTimer = 0;
const pendingThumbnails = new Map<string, Promise<Blob>>();

class EmptyThumbnailRenderError extends Error {}

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

async function resetContext() {
  window.clearTimeout(contextDisposalTimer);
  const contextToDispose = contextPromise;
  contextPromise = null;
  if (!contextToDispose) return;

  const { renderer, environmentTexture } = await contextToDispose;
  environmentTexture.dispose();
  renderer.dispose();
  renderer.forceContextLoss();
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob
        ? resolve(blob)
        : reject(new Error("Unable to encode toy thumbnail")),
      "image/webp",
      WEBP_QUALITY
    );
  });
}

function hasVisibleThumbnailPixels(renderer: Three.WebGLRenderer) {
  const gl = renderer.getContext();
  const pixels = new Uint8Array(THUMBNAIL_SIZE * THUMBNAIL_SIZE * 4);
  gl.readPixels(
    0,
    0,
    THUMBNAIL_SIZE,
    THUMBNAIL_SIZE,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixels
  );

  let visiblePixelCount = 0;
  for (let index = 3; index < pixels.length; index += 4) {
    if (pixels[index] <= 8) continue;
    visiblePixelCount += 1;
    if (visiblePixelCount >= MIN_VISIBLE_PIXEL_COUNT) return true;
  }

  return false;
}

async function renderThumbnail(toy: Collectible) {
  const { THREE, renderer, environmentTexture } = await getContext();
  const modelDefinition = getToyModel(toy.modelId);
  const palette = getToyPalette(toy.paletteId);
  const materialLightScale = toy.materialId === "glass" ? 0.5 : 1;
  const materialExposure = toy.materialId === "glass" ? 0.82 : 1.12;
  const scene = new THREE.Scene();
  scene.environment = environmentTexture;
  renderer.toneMappingExposure = materialExposure;

  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
  camera.position.set(0, 0.58, 7.15);
  camera.lookAt(0, 0.05, 0);

  let prepared: PreparedToyAppearance | null = null;
  try {
    prepared = await prepareToyAppearance(THREE, renderer, toy, {
      profile: "thumbnail",
      modelUrl: modelDefinition.assets.mobileModelUrl
        ?? modelDefinition.assets.modelUrl
    });
    const model = prepared.root;
    if (modelDefinition.id === "color-cat") model.rotation.y -= 0.3;

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scaleByHeight = (
      THUMBNAIL_TARGET_HEIGHT
      * modelDefinition.viewer.scaleMultiplier
    ) / Math.max(size.y, 0.001);
    const scaleByWidth = THUMBNAIL_MAX_WIDTH / Math.max(size.x, 0.001);
    const scaleFactor = Math.min(scaleByHeight, scaleByWidth);
    model.scale.setScalar(scaleFactor);
    model.position.set(
      -center.x * scaleFactor,
      -center.y * scaleFactor + 0.1 + modelDefinition.viewer.yOffset,
      -center.z * scaleFactor
    );
    scene.add(model);

    const { glow } = getCollectibleRenderTraits(toy);
    scene.add(new THREE.HemisphereLight(
      0xffffff,
      palette.attenuation,
      2.2 * materialLightScale
    ));
    const keyLight = new THREE.DirectionalLight(
      0xffffff,
      3.3 * materialLightScale
    );
    keyLight.position.set(-3.8, 5.2, 4.7);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(
      prepared.glowColor,
      (2.35 + glow * 1.6) * materialLightScale
    );
    rimLight.position.set(4.2, 2.8, -3.4);
    scene.add(rimLight);
    const fillLight = new THREE.PointLight(
      0xffffff,
      1.2 * materialLightScale,
      10
    );
    fillLight.position.set(0.6, 1.6, 4.2);
    scene.add(fillLight);
    const underGlow = new THREE.PointLight(
      prepared.glowColor,
      1.8 + glow * 3,
      5.5
    );
    underGlow.position.set(0, -1.65, 0.25);
    scene.add(underGlow);

    renderer.compile(scene, camera);
    renderer.render(scene, camera);
    renderer.render(scene, camera);
    if (!hasVisibleThumbnailPixels(renderer)) {
      throw new EmptyThumbnailRenderError(
        `Thumbnail rendered without visible pixels: ${modelDefinition.id}`
      );
    }
    return await canvasToBlob(renderer.domElement);
  } finally {
    prepared?.dispose();
    scene.clear();
  }
}

function enqueueRender(toy: Collectible) {
  const task = renderQueue
    .then(async () => {
      try {
        return await renderThumbnail(toy);
      } catch (error) {
        if (!(error instanceof EmptyThumbnailRenderError)) throw error;
        await resetContext();
        return renderThumbnail(toy);
      }
    })
    .finally(scheduleContextDisposal);
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
