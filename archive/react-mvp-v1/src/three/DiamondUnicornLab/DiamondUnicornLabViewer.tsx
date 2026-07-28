import { Rotate3D } from "lucide-react";
import { diamondUnicornModel } from "../../features/toys/catalog";
import { useEffect, useRef, useState } from "react";
import {
  applyDiamondUnicornTint,
  createDiamondUnicornMaterial
} from "../material/createDiamondUnicornMaterial";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "../ToyViewer/runtime";

export type DiamondVariant = {
  id: string;
  name: string;
  swatch: string;
};

type Props = {
  variant: DiamondVariant;
  inspectFacets: boolean;
};

type Status = "loading" | "ready" | "error";

type DiamondControls = {
  applyVariant: (swatch: string) => void;
  applyInspectionMode: (enabled: boolean) => void;
  invalidate: () => void;
};

const MODEL_URL = diamondUnicornModel.assets.mobileModelUrl;

export function DiamondUnicornLabViewer({ variant, inspectFacets }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<DiamondControls | null>(null);
  const variantRef = useRef(variant);
  const inspectFacetsRef = useRef(inspectFacets);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    variantRef.current = variant;
    inspectFacetsRef.current = inspectFacets;
    const controls = controlsRef.current;
    if (!controls) return;
    controls.applyVariant(variant.swatch);
    controls.applyInspectionMode(inspectFacets);
    controls.invalidate();
  }, [inspectFacets, variant]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let dispose = () => {};
    setStatus("loading");
    setProgress(0);

    async function setup() {
      const compact = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760;
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.25 : 1.55));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.14;
      renderer.domElement.className = "color-animal-viewer__canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.touchAction = "none";
      renderer.domElement.dataset.modelUrl = MODEL_URL;
      currentHost.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xecefed);

      const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 50);
      camera.position.set(0, 0.05, 8.4);
      camera.lookAt(0, 0, 0);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environmentTexture = pmrem.fromScene(room, 0.035).texture;
      scene.environment = environmentTexture;
      room.dispose();
      pmrem.dispose();

      scene.add(new THREE.HemisphereLight(0xffffff, 0x65746d, 1.65));
      const key = new THREE.DirectionalLight(0xffffff, 3.2);
      key.position.set(-4.5, 6.2, 7);
      scene.add(key);
      const cyanRim = new THREE.DirectionalLight(0xaee7e6, 2.15);
      cyanRim.position.set(5.5, 3.2, -4.5);
      scene.add(cyanRim);
      const roseFill = new THREE.DirectionalLight(0xf2bec9, 1.25);
      roseFill.position.set(-5, -0.5, 3);
      scene.add(roseFill);

      const backdropGeometry = new THREE.PlaneGeometry(14, 9);
      const backdropMaterial = new THREE.MeshBasicMaterial({ color: 0xe9ece9 });
      const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
      backdrop.position.z = -3.2;
      scene.add(backdrop);

      const accentGeometry = new THREE.PlaneGeometry(2.15, 8);
      const accentMaterials = [
        new THREE.MeshBasicMaterial({ color: 0xd7e9e7 }),
        new THREE.MeshBasicMaterial({ color: 0xead8df })
      ];
      const leftAccent = new THREE.Mesh(accentGeometry, accentMaterials[0]);
      leftAccent.position.set(-4.35, 0.1, -3.1);
      leftAccent.rotation.z = -0.09;
      scene.add(leftAccent);
      const rightAccent = new THREE.Mesh(accentGeometry, accentMaterials[1]);
      rightAccent.position.set(4.25, -0.15, -3.08);
      rightAccent.rotation.z = 0.11;
      scene.add(rightAccent);

      const material = createDiamondUnicornMaterial(
        THREE,
        variantRef.current.swatch
      );

      let needsRender = true;
      const controls: DiamondControls = {
        applyVariant: (swatch) => {
          applyDiamondUnicornTint(THREE, material, swatch);
        },
        applyInspectionMode: (enabled) => {
          material.transmission = enabled ? 0.42 : 0.95;
          material.roughness = enabled ? 0.16 : 0.025;
          material.dispersion = enabled ? 0.01 : 0.12;
          material.thickness = enabled ? 0.4 : 1.45;
          material.flatShading = true;
        },
        invalidate: () => {
          needsRender = true;
        }
      };
      controlsRef.current = controls;
      controls.applyVariant(variantRef.current.swatch);
      controls.applyInspectionMode(inspectFacetsRef.current);

      const model = gltf.scene;
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.material = material;
        child.castShadow = false;
        child.receiveShadow = false;
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const scale = 3.45 / Math.max(size.y, size.x, size.z, 0.001);
      model.scale.multiplyScalar(scale);
      const scaledCenter = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      const centeredModel = new THREE.Group();
      centeredModel.position.set(-scaledCenter.x, -scaledCenter.y + 0.04, -scaledCenter.z);
      centeredModel.add(model);

      const stage = new THREE.Group();
      stage.rotation.set(-0.03, -0.34, 0);
      stage.add(centeredModel);
      scene.add(stage);

      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.55, 56),
        new THREE.MeshBasicMaterial({
          color: 0x324640,
          transparent: true,
          opacity: 0.16,
          depthWrite: false
        })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(0, -1.84, 0.08);
      shadow.scale.y = 0.3;
      scene.add(shadow);

      let dragging = false;
      let primaryPointer = -1;
      let previousX = 0;
      let previousY = 0;
      let targetRotationX = -0.03;
      let targetRotationY = -0.34;
      let rotationX = targetRotationX;
      let rotationY = targetRotationY;
      let zoom = 8.4;
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
              5.5,
              10.2
            );
          }
          pinchDistance = distance;
        } else if (dragging && event.pointerId === primaryPointer) {
          targetRotationY += (event.clientX - previousX) * 0.0095;
          targetRotationX = THREE.MathUtils.clamp(
            targetRotationX + (event.clientY - previousY) * 0.006,
            -0.48,
            0.42
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
        targetZoom = THREE.MathUtils.clamp(targetZoom + event.deltaY * 0.004, 5.5, 10.2);
        idleUntil = performance.now() + 5200;
        needsRender = true;
      }

      renderer.domElement.addEventListener("pointerdown", handlePointerDown);
      renderer.domElement.addEventListener("pointermove", handlePointerMove);
      renderer.domElement.addEventListener("pointerup", handlePointerEnd);
      renderer.domElement.addEventListener("pointercancel", handlePointerEnd);
      renderer.domElement.addEventListener("wheel", handleWheel, { passive: false });

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
        const autoRotate = !reducedMotion && !dragging && time < idleUntil;
        if (autoRotate) targetRotationY += delta * 0.16;
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
        controlsRef.current = null;
        renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
        renderer.domElement.removeEventListener("pointermove", handlePointerMove);
        renderer.domElement.removeEventListener("pointerup", handlePointerEnd);
        renderer.domElement.removeEventListener("pointercancel", handlePointerEnd);
        renderer.domElement.removeEventListener("wheel", handleWheel);
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) child.geometry.dispose();
        });
        material.dispose();
        shadow.geometry.dispose();
        (shadow.material as import("three").Material).dispose();
        backdropGeometry.dispose();
        backdropMaterial.dispose();
        accentGeometry.dispose();
        accentMaterials.forEach((accentMaterial) => accentMaterial.dispose());
        environmentTexture.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    }

    setup().catch((error) => {
      console.error("[DiamondUnicornLabViewer] diamond unicorn load failed", error);
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [retryKey]);

  return (
    <div
      className="color-animal-viewer color-animal-viewer--single diamond-unicorn-viewer"
      role="group"
      aria-label={`${variant.name} 3D 独角兽`}
    >
      <div ref={hostRef} className="color-animal-viewer__host" />
      <div className="color-animal-single__palette" aria-label="当前钻石材质">
        <span style={{ background: variant.swatch }} />
        <strong>{inspectFacets ? "切面检查" : variant.name}</strong>
      </div>
      {status === "ready" ? (
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
              <strong>正在加载 Diamond Unicorn</strong>
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
