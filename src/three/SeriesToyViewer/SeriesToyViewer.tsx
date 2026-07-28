import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Rotate3D } from "lucide-react";
import { useSharedToyRotation } from "../../features/home/useSharedToyRotation";
import type { Collectible } from "../../types/toy";
import { loadToyViewerRuntime } from "../ToyViewer/runtime";
import {
  prepareSeriesToy,
  type PreparedSeriesToy
} from "./prepareSeriesToy";

type SeriesToyViewerProps = {
  toys: readonly Collectible[];
  variant: "color" | "special";
  label: string;
  className?: string;
};

type ViewerStatus = "idle" | "loading" | "ready" | "error";

type MountedToy = {
  prepared: PreparedSeriesToy;
  pivot: import("three").Group;
  sourceIndex: number;
  sourceCenter: import("three").Vector3;
  sourceSize: import("three").Vector3;
};

const INITIAL_PIXEL_RATIO_CAP = 1;
const SETTLED_PIXEL_RATIO_CAP = 1.75;

export function SeriesToyViewer({
  toys,
  variant,
  label,
  className = ""
}: SeriesToyViewerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const latestToysRef = useRef(toys);
  const mountedToysRef = useRef<MountedToy[]>([]);
  const requestRenderRef = useRef<() => void>(() => {});
  const inViewportRef = useRef(variant === "color");
  const [shouldInitialize, setShouldInitialize] = useState(variant === "color");
  const [status, setStatus] = useState<ViewerStatus>(
    variant === "color" ? "loading" : "idle"
  );
  const [loadedCount, setLoadedCount] = useState(0);
  const rotation = useSharedToyRotation();
  const modelKey = useMemo(
    () => toys.map((toy) => toy.modelId).join("|"),
    [toys]
  );
  const appearanceKey = useMemo(
    () => toys.map((toy) => toy.appearanceSignature).join("|"),
    [toys]
  );

  latestToysRef.current = toys;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) {
      setShouldInitialize(true);
      inViewportRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      inViewportRef.current = entry.isIntersecting;
      if (entry.isIntersecting) setShouldInitialize(true);
      if (entry.isIntersecting) requestRenderRef.current();
    }, { rootMargin: "260px 0px" });

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    mountedToysRef.current.forEach((mountedToy) => {
      const nextToy = toys[mountedToy.sourceIndex];
      if (nextToy) mountedToy.prepared.updateAppearance(nextToy);
    });
    requestRenderRef.current();
  }, [appearanceKey, toys]);

  useEffect(() => {
    if (!shouldInitialize) return;
    if (!canvasHostRef.current) return;

    let cancelled = false;
    let disposeViewer = () => {};
    setStatus("loading");
    setLoadedCount(0);

    async function setupViewer() {
      const { THREE } = await loadToyViewerRuntime();
      const currentHost = canvasHostRef.current;
      if (cancelled || !currentHost) return;
      const viewerHost: HTMLDivElement = currentHost;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, INITIAL_PIXEL_RATIO_CAP)
      );
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.domElement.className = "series-toy-viewer__canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      viewerHost.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 30);
      camera.position.set(0, 0, 10);
      camera.lookAt(0, 0, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xb7cfc3, 1.95));

      const keyLight = new THREE.DirectionalLight(0xfffbf7, 1.6);
      keyLight.position.set(-4.5, 6.2, 7);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xffe2d6, 0.34);
      fillLight.position.set(5.2, 2.5, 4.5);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xdceaff, 0.3);
      rimLight.position.set(4, 3.5, -5);
      scene.add(rimLight);

      const mountedToys: MountedToy[] = [];
      mountedToysRef.current = mountedToys;
      const clock = new THREE.Clock();
      let disposed = false;
      let frameId = 0;
      let clarityTimer = 0;
      let lastRenderTime = 0;
      let needsRender = true;
      let currentRotation = rotation.controller.getRotation();
      let layoutWidth = 1;
      let layoutHeight = 1;
      let resizeObserver: ResizeObserver | null = null;
      let unsubscribeRotation: (() => void) | null = null;
      let firstFrameRendered = false;

      function layoutModels() {
        const columns = variant === "color"
          ? 4
          : Math.max(toys.length, 1);
        const rows = Math.max(1, Math.ceil(toys.length / columns));
        const worldHeight = rows * 2.18;
        const aspect = layoutWidth / Math.max(layoutHeight, 1);
        const worldWidth = worldHeight * aspect;
        camera.left = -worldWidth / 2;
        camera.right = worldWidth / 2;
        camera.top = worldHeight / 2;
        camera.bottom = -worldHeight / 2;
        camera.updateProjectionMatrix();

        const cellWidth = worldWidth / columns;
        const cellHeight = worldHeight / rows;
        mountedToys.forEach(({
          prepared,
          pivot,
          sourceIndex,
          sourceCenter,
          sourceSize
        }) => {
          const row = Math.floor(sourceIndex / columns);
          const column = sourceIndex % columns;
          const heightScale = (
            cellHeight
            * (variant === "color" ? 0.70 : 0.74)
            * prepared.modelDefinition.viewer.scaleMultiplier
          ) / Math.max(sourceSize.y, 0.001);
          const widthScale = (cellWidth * 0.76) / Math.max(sourceSize.x, 0.001);
          const scale = Math.min(heightScale, widthScale);

          prepared.root.scale.setScalar(scale);
          prepared.root.position.set(
            -sourceCenter.x * scale,
            -sourceCenter.y * scale + prepared.modelDefinition.viewer.yOffset,
            -sourceCenter.z * scale
          );
          pivot.position.set(
            -worldWidth / 2 + cellWidth * (column + 0.5),
            worldHeight / 2 - cellHeight * (row + 0.5),
            0
          );
        });
        needsRender = true;
      }

      function resize() {
        layoutWidth = Math.max(viewerHost.clientWidth, 1);
        layoutHeight = Math.max(viewerHost.clientHeight, 1);
        renderer.setSize(layoutWidth, layoutHeight, false);
        layoutModels();
      }

      function render(time: number) {
        frameId = window.requestAnimationFrame(render);
        if (
          cancelled
          || disposed
          || document.hidden
          || !inViewportRef.current
        ) return;

        const targetRotation = rotation.controller.getRotation();
        const settling = Math.abs(currentRotation - targetRotation) > 0.0005;
        const hasAnimations = mountedToys.some(({ prepared }) => prepared.mixer);
        if (!needsRender && !settling && !hasAnimations) return;
        if (time - lastRenderTime < 1000 / (settling ? 30 : 20)) return;

        const delta = Math.min(clock.getDelta(), 0.05);
        lastRenderTime = time;
        currentRotation = THREE.MathUtils.lerp(
          currentRotation,
          targetRotation,
          0.2
        );
        mountedToys.forEach(({ prepared, pivot }) => {
          pivot.rotation.y = currentRotation;
          prepared.mixer?.update(delta);
        });
        renderer.render(scene, camera);
        needsRender = hasAnimations
          || Math.abs(currentRotation - targetRotation) > 0.0005;

        if (!firstFrameRendered && mountedToys.length > 0) {
          firstFrameRendered = true;
          clarityTimer = window.setTimeout(() => {
            if (cancelled || disposed) return;
            renderer.setPixelRatio(
              Math.min(window.devicePixelRatio, SETTLED_PIXEL_RATIO_CAP)
            );
            resize();
          }, 120);
        }
      }

      disposeViewer = () => {
        if (disposed) return;
        disposed = true;
        window.cancelAnimationFrame(frameId);
        window.clearTimeout(clarityTimer);
        resizeObserver?.disconnect();
        unsubscribeRotation?.();
        requestRenderRef.current = () => {};
        mountedToys.forEach(({ prepared, pivot }) => {
          scene.remove(pivot);
          prepared.dispose();
        });
        mountedToys.length = 0;
        mountedToysRef.current = [];
        scene.clear();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(viewerHost);
      resize();

      requestRenderRef.current = () => {
        needsRender = true;
      };
      unsubscribeRotation = rotation.controller.subscribe(() => {
        needsRender = true;
      });

      frameId = window.requestAnimationFrame(render);

      async function loadSeriesToy(toy: Collectible, sourceIndex: number) {
        const prepared = await prepareSeriesToy(THREE, renderer, toy);
        if (cancelled || disposed) {
          prepared.dispose();
          return;
        }

        const sourceBox = new THREE.Box3().setFromObject(prepared.root);
        const sourceCenter = sourceBox.getCenter(new THREE.Vector3());
        const sourceSize = sourceBox.getSize(new THREE.Vector3());
        const pivot = new THREE.Group();
        pivot.add(prepared.root);
        scene.add(pivot);
        mountedToys.push({
          prepared,
          pivot,
          sourceIndex,
          sourceCenter,
          sourceSize
        });
        const currentToy = latestToysRef.current[sourceIndex];
        if (currentToy) prepared.updateAppearance(currentToy);
        layoutModels();
        setLoadedCount((count) => count + 1);
      }

      const results: PromiseSettledResult<void>[] = [];
      const currentToys = latestToysRef.current;
      for (let start = 0; start < currentToys.length; start += 6) {
        if (cancelled || disposed) return;
        const batch = currentToys
          .slice(start, start + 6)
          .map((toy, offset) => loadSeriesToy(toy, start + offset));
        results.push(...await Promise.allSettled(batch));
      }
      if (cancelled || disposed) return;
      const successfulLoads = results.filter(
        (result) => result.status === "fulfilled"
      ).length;
      setStatus(successfulLoads > 0 ? "ready" : "error");
    }

    setupViewer().catch((error) => {
      disposeViewer();
      console.error("[SeriesToyViewer] 系列模型加载失败", error);
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      disposeViewer();
    };
  }, [
    modelKey,
    rotation.controller,
    shouldInitialize,
    toys.length,
    variant
  ]);

  return (
    <div
      ref={rootRef}
      className={`series-toy-viewer${className ? ` ${className}` : ""}`}
      data-count={toys.length}
      data-loaded={loadedCount}
      data-status={status}
      role="group"
      aria-label={`${label}。左右拖动可同步旋转全部玩偶。`}
      tabIndex={0}
      onPointerDown={rotation.handlePointerDown}
      onPointerMove={rotation.handlePointerMove}
      onPointerUp={rotation.handlePointerUp}
      onPointerCancel={rotation.handlePointerCancel}
      onKeyDown={rotation.handleKeyDown}
    >
      <div className="series-toy-viewer__canvas-host" ref={canvasHostRef} />
      {status === "idle" ? (
        <span className="series-toy-viewer__status">滑到这里唤醒 3D 玩偶</span>
      ) : null}
      {status === "loading" ? (
        <span className="series-toy-viewer__status" role="status">
          正在唤醒 {loadedCount} / {toys.length}
        </span>
      ) : null}
      {status === "ready" ? (
        <span className="series-toy-viewer__hint">
          <Rotate3D size={13} aria-hidden="true" />
          左右拖动旋转
        </span>
      ) : null}
      {status === "error" ? (
        <span className="series-toy-viewer__status" role="alert">
          3D 玩偶暂时没有加载成功
        </span>
      ) : null}
    </div>
  );
}
