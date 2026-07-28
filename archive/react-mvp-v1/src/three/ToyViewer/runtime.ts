type ThreeRuntime = {
  THREE: typeof import("three");
  GLTFLoader: typeof import("three/examples/jsm/loaders/GLTFLoader.js").GLTFLoader;
  DRACOLoader: typeof import("three/examples/jsm/loaders/DRACOLoader.js").DRACOLoader;
};

type LoadedGltf = import("three/examples/jsm/loaders/GLTFLoader.js").GLTF;
type ModelProgressListener = (loaded: number, total: number) => void;

type ModelCacheEntry = {
  promise: Promise<LoadedGltf>;
  progressListeners: Set<ModelProgressListener>;
};

let runtimePromise: Promise<ThreeRuntime> | null = null;
let roomEnvironmentPromise: Promise<
  typeof import("three/examples/jsm/environments/RoomEnvironment.js").RoomEnvironment
> | null = null;

const warmedUrls = new Set<string>();
const modelPromiseCache = new Map<string, ModelCacheEntry>();

export function loadToyViewerRuntime() {
  runtimePromise ??= Promise.all([
    import("three"),
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/loaders/DRACOLoader.js")
  ]).then(([THREE, { GLTFLoader }, { DRACOLoader }]) => ({ THREE, GLTFLoader, DRACOLoader }));

  return runtimePromise;
}

export function loadRoomEnvironment() {
  roomEnvironmentPromise ??= import(
    "three/examples/jsm/environments/RoomEnvironment.js"
  ).then(({ RoomEnvironment }) => RoomEnvironment);

  return roomEnvironmentPromise;
}

function warmUrl(url: string) {
  if (warmedUrls.has(url)) return Promise.resolve();
  warmedUrls.add(url);

  return fetch(url, { cache: "force-cache" }).then((response) => {
    if (!response.ok) throw new Error(`Failed to preload ${url}`);
  });
}

function cloneLoadedGltf(gltf: LoadedGltf): LoadedGltf {
  const scene = gltf.scene.clone(true);

  // Each viewer owns its geometry so unmounting one instance cannot invalidate
  // the decoded source retained in the module-level cache.
  scene.traverse((child) => {
    if ("isMesh" in child && child.isMesh) {
      const mesh = child as import("three").Mesh;
      mesh.geometry = mesh.geometry.clone();
    }
  });

  return { ...gltf, scene, scenes: [scene] };
}

/** Download and Draco-decode each model URL once, then clone it per viewer. */
export function loadToyModel(modelUrl: string, onProgress?: ModelProgressListener) {
  let entry = modelPromiseCache.get(modelUrl);

  if (!entry) {
    const progressListeners = new Set<ModelProgressListener>();
    const promise = loadToyViewerRuntime().then(async ({ GLTFLoader, DRACOLoader }) => {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/draco/");
      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);

      try {
        return await gltfLoader.loadAsync(modelUrl, (event) => {
          progressListeners.forEach((listener) => listener(event.loaded, event.total));
        });
      } finally {
        dracoLoader.dispose();
      }
    });

    entry = { promise, progressListeners };
    modelPromiseCache.set(modelUrl, entry);
    promise.catch(() => modelPromiseCache.delete(modelUrl));
  }

  if (onProgress) entry.progressListeners.add(onProgress);

  return entry.promise
    .then(cloneLoadedGltf)
    .finally(() => {
      if (onProgress) entry?.progressListeners.delete(onProgress);
    });
}

/** Warm the Three.js chunk, Draco decoder and GLB before the viewer is mounted. */
export function preloadToyViewer(modelUrl: string) {
  return Promise.allSettled([
    loadToyViewerRuntime(),
    warmUrl("/draco/draco_wasm_wrapper.js"),
    warmUrl("/draco/draco_decoder.wasm"),
    loadToyModel(modelUrl)
  ]);
}

export function scheduleToyViewerPreload(modelUrl: string) {
  const run = () => void preloadToyViewer(modelUrl);

  if ("requestIdleCallback" in window) {
    const idleWindow = window as Window & {
      requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number;
    };
    return idleWindow.requestIdleCallback(run, { timeout: 900 });
  }

  return globalThis.setTimeout(run, 240);
}
