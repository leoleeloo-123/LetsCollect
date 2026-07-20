import { Rotate3D } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "../ToyViewer/runtime";
import { addBirdSemanticAttributes } from "./semanticZones";
import { colorizeBirdV4 } from "./shaderV4";

export type BirdColorVariant = {
  id: string;
  name: string;
  bodySwatch: string;
  capSwatch: string;
  blushSwatch: string;
};

type Props = {
  variant: BirdColorVariant;
  showZones: boolean;
};

type Status = "loading" | "ready" | "error";
type BirdControls = {
  body: import("three").Color;
  cap: import("three").Color;
  feet: import("three").Color;
  blush: import("three").Color;
  debugMode: { value: number };
  invalidate: () => void;
};

const MODEL_URL = "/models/toys/color-bird/model-mobile-v001.glb";
const ZONE_MASK_URL = "/models/toys/color-bird/protect-mask-mobile-v014.webp";


export function ColorBirdLabViewer({ variant, showZones }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<BirdControls | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.body.set(variant.bodySwatch).multiplyScalar(0.92);
    controls.cap.set(variant.capSwatch).multiplyScalar(0.92);
    controls.blush.set(variant.blushSwatch).multiplyScalar(0.94);
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
      const compact = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760;
      const [{ THREE }, RoomEnvironment, gltf] = await Promise.all([
        loadToyViewerRuntime(),
        loadRoomEnvironment(),
        loadToyModel(MODEL_URL, (loaded, total) => {
          if (!cancelled && total > 0) setProgress(Math.min(100, Math.round((loaded / total) * 100)));
        })
      ]);
      if (cancelled || !hostRef.current) return;

      const zoneMap = await new THREE.TextureLoader().loadAsync(ZONE_MASK_URL);
      zoneMap.flipY = false;
      zoneMap.colorSpace = THREE.NoColorSpace;
      zoneMap.wrapS = THREE.RepeatWrapping;
      zoneMap.wrapT = THREE.RepeatWrapping;
      zoneMap.generateMipmaps = false;
      zoneMap.minFilter = THREE.LinearFilter;
      zoneMap.magFilter = THREE.LinearFilter;
      zoneMap.needsUpdate = true;

      const currentHost = hostRef.current;
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.35 : 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.02;
      renderer.domElement.className = "color-dog-viewer__canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.touchAction = "none";
      renderer.domElement.dataset.modelUrl = MODEL_URL;
      currentHost.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf3eee9);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0.08, 6.4);
      camera.lookAt(0, 0, 0);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environmentTexture = pmrem.fromScene(room, 0.04).texture;
      scene.environment = environmentTexture;
      room.dispose();
      pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x7d7169, 1.82));
      const key = new THREE.DirectionalLight(0xfffbf7, 1.75);
      key.position.set(-4.5, 6.2, 7);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffddd2, 0.42);
      fill.position.set(5.2, 2.5, 4.5);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xdceaff, 0.36);
      rim.position.set(4, 3.5, -5);
      scene.add(rim);

      let needsRender = true;
      const controls: BirdControls = {
        body: new THREE.Color(variant.bodySwatch).multiplyScalar(0.92),
        cap: new THREE.Color(variant.capSwatch).multiplyScalar(0.92),
        blush: new THREE.Color(variant.blushSwatch).multiplyScalar(0.94),
        feet: new THREE.Color("#efa04f").multiplyScalar(0.94),
        debugMode: { value: showZones ? 1 : 0 },
        invalidate: () => { needsRender = true; }
      };
      controlsRef.current = controls;

      const model = gltf.scene;
      const materials: import("three").Material[] = [];
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        addBirdSemanticAttributes(child.geometry, THREE);
        const originals = Array.isArray(child.material) ? child.material : [child.material];
        const clones = originals.map((original) => {
          const clone = original.clone();
          if (clone instanceof THREE.MeshStandardMaterial) {
            clone.metalness = 0;
            clone.roughness = 0.94;
            clone.envMapIntensity = 0.16;
            clone.metalnessMap = null;
            clone.roughnessMap = null;
            if (clone.map) {
              clone.map.generateMipmaps = false;
              clone.map.minFilter = THREE.LinearFilter;
              clone.map.magFilter = THREE.LinearFilter;
              clone.map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
              clone.map.needsUpdate = true;
            }
          }
          colorizeBirdV4(clone, controls, zoneMap);
          materials.push(clone);
          return clone;
        });
        child.material = Array.isArray(child.material) ? clones : clones[0];
      });

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 3.15 / Math.max(size.y, 0.001);
      model.scale.setScalar(scale);
      model.position.set(-center.x * scale, -center.y * scale - 0.02, -center.z * scale);

      const stage = new THREE.Group();
      stage.rotation.y = -0.08;
      stage.add(model);
      scene.add(stage);

      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.18, 52),
        new THREE.MeshBasicMaterial({ color: 0x3d2e29, transparent: true, opacity: 0.13, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(0, -1.63, 0.12);
      shadow.scale.y = 0.48;
      scene.add(shadow);

      let dragging = false;
      let primaryPointer = -1;
      let previousX = 0;
      let previousY = 0;
      let targetRotationX = -0.025;
      let targetRotationY = -0.08;
      let rotationX = targetRotationX;
      let rotationY = targetRotationY;
      let zoom = 6.4;
      let targetZoom = zoom;
      let idleUntil = performance.now() + 4200;
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
        idleUntil = performance.now() + 4200;
        needsRender = true;
      }

      function handlePointerMove(event: PointerEvent) {
        if (!pointers.has(event.pointerId)) return;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (pinchDistance > 0) targetZoom = THREE.MathUtils.clamp(targetZoom - (distance - pinchDistance) * 0.012, 5.1, 8.2);
          pinchDistance = distance;
        } else if (dragging && event.pointerId === primaryPointer) {
          targetRotationY += (event.clientX - previousX) * 0.0095;
          targetRotationX = THREE.MathUtils.clamp(targetRotationX + (event.clientY - previousY) * 0.006, -0.3, 0.26);
          previousX = event.clientX;
          previousY = event.clientY;
        }
        idleUntil = performance.now() + 4200;
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
        idleUntil = performance.now() + 4200;
        needsRender = true;
      }

      function handleWheel(event: WheelEvent) {
        event.preventDefault();
        targetZoom = THREE.MathUtils.clamp(targetZoom + event.deltaY * 0.004, 5.1, 8.2);
        idleUntil = performance.now() + 4200;
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
        zoneMap.dispose();
        environmentTexture.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    }

    setup().catch((error) => {
      console.error("[ColorBirdLabViewer] color bird load failed", error);
      if (!cancelled) setStatus("error");
    });
    return () => { cancelled = true; dispose(); };
  }, [retryKey]);

  return (
    <div className="color-dog-viewer color-bird-viewer" role="group" aria-label={`${variant.name} 3D 小鸟`}>
      <div ref={hostRef} className="color-dog-viewer__host" />
      <div className="color-bird-viewer__palette" aria-label="当前随机配色">
        <span style={{ background: variant.bodySwatch }} title="主体色" />
        <span style={{ background: variant.capSwatch }} title="头顶色" />
        <span style={{ background: variant.blushSwatch }} title="腮红色" />
        <strong>{showZones ? "分区检查" : variant.name}</strong>
      </div>
      {status === "ready" ? <div className="color-bird-viewer__hint"><Rotate3D size={15} />拖动 360° 查看 · 双指缩放</div> : null}
      {status !== "ready" ? (
        <div className={`color-dog-viewer__status color-dog-viewer__status--${status}`} role="status">
          {status === "loading" ? <><span className="color-dog-viewer__spinner" /><strong>正在加载 Color Bird</strong><span>{progress}%</span></> : <><strong>3D 加载失败</strong><button type="button" onClick={() => setRetryKey((value) => value + 1)}>重新尝试</button></>}
        </div>
      ) : null}
    </div>
  );
}
