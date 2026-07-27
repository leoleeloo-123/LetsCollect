import { Rotate3D } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cloneColorDogDrumMaterials } from "../material/createColorDogDrumMaterials";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "../ToyViewer/runtime";
import type { ToyRotationController } from "../ToyViewer";

export type DogDrumVariant = {
  id: string;
  name: string;
  swatch: string;
};

type Props = {
  variant: DogDrumVariant;
  showZones: boolean;
  compact?: boolean;
  interactive?: boolean;
  rotationController?: ToyRotationController;
};

type Status = "loading" | "ready" | "error";

type DogDrumControls = {
  color: import("three").Color;
  debugMode: { value: number };
  invalidate: () => void;
};

const MODEL_URL = "/models/toys/color-dog-drum/model-mobile-v001.glb?v=1";

export function ColorDogDrumLabViewer({
  variant,
  showZones,
  compact = false,
  interactive = true,
  rotationController
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<DogDrumControls | null>(null);
  const variantRef = useRef(variant);
  const showZonesRef = useRef(showZones);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    variantRef.current = variant;
    showZonesRef.current = showZones;
    const controls = controlsRef.current;
    if (!controls) return;
    controls.color.set(variant.swatch).multiplyScalar(0.92);
    controls.debugMode.value = showZones ? 1 : 0;
    controls.invalidate();
  }, [showZones, variant]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let dispose = () => {};
    setStatus("loading");
    setProgress(0);

    async function setup() {
      const compactViewport = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760;
      const [{ THREE }, RoomEnvironment, gltf] = await Promise.all([
        loadToyViewerRuntime(),
        loadRoomEnvironment(),
        loadToyModel(MODEL_URL, (loaded, total) => {
          if (!cancelled && total > 0) {
            setProgress(Math.min(100, Math.round((loaded / total) * 100)));
          }
        })
      ]);
      if (cancelled || !hostRef.current) return;

      const currentHost = hostRef.current;
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compactViewport ? 1.3 : 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.02;
      renderer.domElement.className = "color-animal-viewer__canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.touchAction = interactive && !rotationController ? "none" : "pan-y";
      renderer.domElement.style.pointerEvents = rotationController ? "none" : "auto";
      renderer.domElement.dataset.modelUrl = MODEL_URL;
      currentHost.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf1eee9);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0.02, 6.7);
      camera.lookAt(0, 0, 0);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environmentTexture = pmrem.fromScene(room, 0.04).texture;
      scene.environment = environmentTexture;
      room.dispose();
      pmrem.dispose();

      scene.add(new THREE.HemisphereLight(0xffffff, 0x76675f, 1.85));
      const key = new THREE.DirectionalLight(0xfffbf7, 1.7);
      key.position.set(-4.5, 6.2, 7);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffe6dc, 0.38);
      fill.position.set(5.2, 2.5, 4.5);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xdceaff, 0.32);
      rim.position.set(4, 3.5, -5);
      scene.add(rim);

      let needsRender = true;
      const controls: DogDrumControls = {
        color: new THREE.Color(variantRef.current.swatch).multiplyScalar(0.92),
        debugMode: { value: showZonesRef.current ? 1 : 0 },
        invalidate: () => {
          needsRender = true;
        }
      };
      controlsRef.current = controls;

      const model = gltf.scene;
      const materials = cloneColorDogDrumMaterials(
        THREE,
        model,
        controls.color,
        renderer.capabilities.getMaxAnisotropy(),
        controls.debugMode
      );

      const initialBox = new THREE.Box3().setFromObject(model);
      const initialSize = initialBox.getSize(new THREE.Vector3());
      const scale = 3.55 / Math.max(initialSize.x, initialSize.y, initialSize.z, 0.001);
      model.scale.multiplyScalar(scale);
      const scaledBox = new THREE.Box3().setFromObject(model);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      const scaledSize = scaledBox.getSize(new THREE.Vector3());
      const centeredModel = new THREE.Group();
      centeredModel.position.set(-scaledCenter.x, -scaledCenter.y + 0.02, -scaledCenter.z);
      centeredModel.add(model);

      const stage = new THREE.Group();
      stage.rotation.set(-0.02, rotationController?.getRotation() ?? -0.24, 0);
      stage.add(centeredModel);
      scene.add(stage);

      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(Math.max(1.25, scaledSize.x * 0.42), 56),
        new THREE.MeshBasicMaterial({
          color: 0x3d332e,
          transparent: true,
          opacity: 0.12,
          depthWrite: false
        })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(0, -scaledSize.y * 0.51, 0.08);
      shadow.scale.y = 0.42;
      scene.add(shadow);

      let dragging = false;
      let primaryPointer = -1;
      let previousX = 0;
      let previousY = 0;
      let targetRotationX = -0.02;
      let targetRotationY = rotationController?.getRotation() ?? -0.24;
      let rotationX = targetRotationX;
      let rotationY = targetRotationY;
      let zoom = 6.7;
      let targetZoom = zoom;
      let idleUntil = performance.now() + 5200;
      let pinchDistance = 0;
      const pointers = new Map<number, { x: number; y: number }>();

      function handlePointerDown(event: PointerEvent) {
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        renderer.domElement.setPointerCapture(event.pointerId);
        if (pointers.size === 1) {
          dragging = true;
          primaryPointer = event.pointerId;
          previousX = event.clientX;
          previousY = event.clientY;
          renderer.domElement.classList.add("is-dragging");
        } else {
          const [a, b] = [...pointers.values()];
          pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
        }
        idleUntil = performance.now() + 5200;
        needsRender = true;
      }

      function handlePointerMove(event: PointerEvent) {
        if (!pointers.has(event.pointerId)) return;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinchDistance > 0) {
            targetZoom = THREE.MathUtils.clamp(
              targetZoom - (distance - pinchDistance) * 0.012,
              5.2,
              8.5
            );
          }
          pinchDistance = distance;
        } else if (dragging && event.pointerId === primaryPointer) {
          targetRotationY += (event.clientX - previousX) * 0.0095;
          targetRotationX = THREE.MathUtils.clamp(
            targetRotationX + (event.clientY - previousY) * 0.006,
            -0.34,
            0.3
          );
          previousX = event.clientX;
          previousY = event.clientY;
        }
        idleUntil = performance.now() + 5200;
        needsRender = true;
      }

      function handlePointerEnd(event: PointerEvent) {
        pointers.delete(event.pointerId);
        if (event.pointerId === primaryPointer) {
          dragging = false;
          primaryPointer = -1;
          renderer.domElement.classList.remove("is-dragging");
        }
        if (pointers.size < 2) pinchDistance = 0;
        idleUntil = performance.now() + 5200;
        needsRender = true;
      }

      function handleWheel(event: WheelEvent) {
        event.preventDefault();
        targetZoom = THREE.MathUtils.clamp(targetZoom + event.deltaY * 0.004, 5.2, 8.5);
        idleUntil = performance.now() + 5200;
        needsRender = true;
      }

      if (interactive && !rotationController) {
        renderer.domElement.addEventListener("pointerdown", handlePointerDown);
        renderer.domElement.addEventListener("pointermove", handlePointerMove);
        renderer.domElement.addEventListener("pointerup", handlePointerEnd);
        renderer.domElement.addEventListener("pointercancel", handlePointerEnd);
        renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });
      }
      const unsubscribeRotation = rotationController?.subscribe(() => {
        targetRotationY = rotationController.getRotation();
        needsRender = true;
      }) ?? (() => {});

      function resize() {
        const width = Math.max(1, currentHost.clientWidth);
        const height = Math.max(1, currentHost.clientHeight);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        needsRender = true;
      }
      const observer = new ResizeObserver(resize);
      observer.observe(currentHost);
      resize();

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const clock = new THREE.Clock();
      let frameId = 0;
      let lastFrame = 0;

      function render(time: number) {
        frameId = requestAnimationFrame(render);
        if (document.hidden || time - lastFrame < 1000 / (dragging ? 60 : 30)) return;
        const delta = Math.min(clock.getDelta(), 0.05);
        lastFrame = time;
        const autoRotate = !rotationController && !reducedMotion && !dragging && time < idleUntil;
        if (autoRotate) targetRotationY += delta * 0.14;
        rotationX = THREE.MathUtils.lerp(rotationX, targetRotationX, 0.12);
        rotationY = THREE.MathUtils.lerp(rotationY, targetRotationY, 0.12);
        zoom = THREE.MathUtils.lerp(zoom, targetZoom, 0.12);
        const moving = Math.abs(rotationX - targetRotationX) > 0.0005
          || Math.abs(rotationY - targetRotationY) > 0.0005
          || Math.abs(zoom - targetZoom) > 0.001;
        if (!autoRotate && !moving && !needsRender) return;
        stage.rotation.x = rotationX;
        stage.rotation.y = rotationY;
        camera.position.z = zoom;
        renderer.render(scene, camera);
        needsRender = false;
      }

      renderer.compile(scene, camera);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
      setStatus("ready");
      setProgress(100);

      dispose = () => {
        cancelAnimationFrame(frameId);
        observer.disconnect();
        unsubscribeRotation();
        controlsRef.current = null;
        renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
        renderer.domElement.removeEventListener("pointermove", handlePointerMove);
        renderer.domElement.removeEventListener("pointerup", handlePointerEnd);
        renderer.domElement.removeEventListener("pointercancel", handlePointerEnd);
        renderer.domElement.removeEventListener("wheel", handleWheel);
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) child.geometry.dispose();
        });
        materials.forEach((material) => material.dispose());
        shadow.geometry.dispose();
        (shadow.material as import("three").Material).dispose();
        environmentTexture.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    }

    setup().catch((error) => {
      console.error("[ColorDogDrumLabViewer] model load failed", error);
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [interactive, retryKey, rotationController]);

  return (
    <div
      className={`color-animal-viewer color-animal-viewer--single color-dog-drum-viewer${compact ? " color-dog-drum-viewer--compact" : ""}`}
      role="group"
      aria-label={`${variant.name} Color Dog Drum 3D`}
      data-status={status}
    >
      <div ref={hostRef} className="color-animal-viewer__host" />
      {!compact ? (
        <div className="color-animal-single__palette" aria-label="当前鼓颜色">
          <span style={{ background: variant.swatch }} />
          <strong>{showZones ? "鼓区域检查" : variant.name}</strong>
        </div>
      ) : null}
      {status === "ready" && !compact ? (
        <div className="color-animal-single__hint">
          <Rotate3D size={15} />
          拖动 360° 查看 · 双指缩放
        </div>
      ) : null}
      {status !== "ready" ? (
        <div
          className={`color-animal-viewer__status color-animal-viewer__status--${status}`}
          role="status"
        >
          {status === "loading" ? (
            <>
              <span className="color-animal-viewer__spinner" />
              <strong>正在加载 Color Dog Drum</strong>
              <span>{progress}%</span>
            </>
          ) : (
            <>
              <strong>3D 加载失败</strong>
              <button type="button" onClick={() => setRetryKey((value) => value + 1)}>
                重新尝试
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
