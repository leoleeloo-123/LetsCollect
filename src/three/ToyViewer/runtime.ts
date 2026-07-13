type ThreeRuntime = {
  THREE: typeof import("three");
  GLTFLoader: typeof import("three/examples/jsm/loaders/GLTFLoader.js").GLTFLoader;
  DRACOLoader: typeof import("three/examples/jsm/loaders/DRACOLoader.js").DRACOLoader;
};

let runtimePromise: Promise<ThreeRuntime> | null = null;
let roomEnvironmentPromise: Promise<
  typeof import("three/examples/jsm/environments/RoomEnvironment.js").RoomEnvironment
> | null = null;

const warmedUrls = new Set<string>();

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

/** Warm the Three.js chunk, Draco decoder and GLB before the viewer is mounted. */
export function preloadToyViewer(modelUrl: string) {
  return Promise.allSettled([
    loadToyViewerRuntime(),
    warmUrl("/draco/draco_wasm_wrapper.js"),
    warmUrl("/draco/draco_decoder.wasm"),
    warmUrl(modelUrl)
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
