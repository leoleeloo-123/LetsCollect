import type * as Three from "three";
import { getToyModel, getToyPalette } from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";
import {
  createToyMaterial,
  getCollectibleRenderTraits
} from "../material/createToyMaterial";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "../ToyViewer/runtime";
import { readThumbnailBlob, writeThumbnailBlob } from "./storage";

const THUMBNAIL_SIZE = 384;
const THUMBNAIL_RENDER_VERSION = 10;
const WEBP_QUALITY = 0.84;

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

  const { material, glowColor } = createToyMaterial(THREE, toy);
  const { glow } = getCollectibleRenderTraits(toy);
  const model = gltf.scene;
  model.rotation.y = modelDefinition.viewer.rotationY - 0.08;
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.material = material;
    child.castShadow = false;
    child.receiveShadow = false;
  });

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
    material.dispose();
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
