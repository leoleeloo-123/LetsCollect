import { Rotate3D } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "../ToyViewer/runtime";

export type UnicornColorVariant = {
  id: string;
  name: string;
  bodySwatch: string;
  hornSwatch: string;
};

type Props = { variant: UnicornColorVariant };
type Status = "loading" | "ready" | "error";
type ColorControls = {
  body: import("three").Color;
  horn: import("three").Color;
  invalidate: () => void;
};

const MODEL_URL = "/models/toys/jelly-jade-unicorn/model-mobile-v001.glb";

function applyCleanColorZones(
  material: import("three").MeshStandardMaterial,
  controls: Pick<ColorControls, "body" | "horn">
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.unicornBodyColor = { value: controls.body };
    shader.uniforms.unicornHornColor = { value: controls.horn };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 unicornLocalPosition;
varying vec3 unicornLocalNormal;`)
      .replace("#include <begin_vertex>", `vec3 transformed = vec3(position);
unicornLocalPosition = position;
unicornLocalNormal = normal;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 unicornBodyColor;
uniform vec3 unicornHornColor;
varying vec3 unicornLocalPosition;
varying vec3 unicornLocalNormal;`)
      .replace("#include <color_fragment>", `#include <color_fragment>
float hornMask = smoothstep(0.54, 0.61, unicornLocalPosition.y)
  * (1.0 - smoothstep(0.055, 0.105, abs(unicornLocalPosition.x + 0.135)));
float allHooves = 1.0 - smoothstep(-0.515, -0.445, unicornLocalPosition.y);
vec3 cleanColor = mix(unicornBodyColor, unicornHornColor, hornMask);
cleanColor = mix(cleanColor, vec3(0.025, 0.022, 0.026), allHooves);
diffuseColor.rgb *= cleanColor;`);
  };
  material.customProgramCacheKey = () => "clean-unicorn-zones-v1";
  material.needsUpdate = true;
}

function createDisc(
  THREE: typeof import("three"),
  material: import("three").Material,
  scaleX: number,
  scaleY: number,
  z: number,
  segments = 40
) {
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, segments), material);
  mesh.scale.set(scaleX, scaleY, 1);
  mesh.position.z = z;
  return mesh;
}

function createFaceDetails(THREE: typeof import("three")) {
  const root = new THREE.Group();
  root.name = "stable-face-details";
  const resources = new Set<import("three").Material | import("three").BufferGeometry>();
  const outline = new THREE.MeshStandardMaterial({ color: 0x211b21, roughness: 0.42, metalness: 0 });
  const white = new THREE.MeshStandardMaterial({ color: 0xfffcf8, roughness: 0.5, metalness: 0 });
  const iris = new THREE.MeshPhysicalMaterial({ color: 0x6f4c3d, roughness: 0.24, metalness: 0, clearcoat: 0.75, clearcoatRoughness: 0.2 });
  const pupil = new THREE.MeshPhysicalMaterial({ color: 0x17141a, roughness: 0.2, metalness: 0, clearcoat: 0.9 });
  const highlight = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const blush = new THREE.MeshStandardMaterial({ color: 0xf39aae, roughness: 0.82, metalness: 0 });
  const mouthLine = new THREE.MeshStandardMaterial({ color: 0x66343e, roughness: 0.72, metalness: 0 });
  [outline, white, iris, pupil, highlight, blush, mouthLine].forEach((item) => resources.add(item));

  [-1, 1].forEach((side) => {
    const eye = new THREE.Group();
    eye.position.set(side === -1 ? -0.30 : -0.03, 0.095, 0.535);
    if (side === -1) eye.scale.setScalar(0.84);
    eye.rotation.y = side * -0.13;
    const outer = createDisc(THREE, outline, 0.05, 0.068, 0);
    const sclera = createDisc(THREE, white, 0.044, 0.061, 0.004);
    const irisDisc = createDisc(THREE, iris, 0.032, 0.047, 0.008);
    irisDisc.position.set(side * -0.006, -0.008, 0.008);
    const pupilDisc = createDisc(THREE, pupil, 0.02, 0.034, 0.012);
    pupilDisc.position.y = -0.006;
    const mainHighlight = createDisc(THREE, highlight, 0.008, 0.011, 0.016, 24);
    mainHighlight.position.set(side * -0.01, 0.017, 0.016);
    const tinyHighlight = createDisc(THREE, highlight, 0.004, 0.006, 0.017, 20);
    tinyHighlight.position.set(side * 0.011, -0.014, 0.017);
    eye.add(outer, sclera, irisDisc, pupilDisc, mainHighlight, tinyHighlight);
    root.add(eye);
  });

  const muzzle = new THREE.Group();
  muzzle.position.set(-0.18, -0.02, 0.584);
  const patch = createDisc(THREE, blush, 0.115, 0.057, 0, 48);
  const leftNostril = createDisc(THREE, mouthLine, 0.009, 0.006, 0.004, 20);
  leftNostril.position.set(-0.037, 0.014, 0.004);
  const rightNostril = leftNostril.clone();
  rightNostril.position.x = 0.037;
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.0045, 8, 32, Math.PI), mouthLine);
  mouth.rotation.z = Math.PI;
  mouth.scale.y = 0.64;
  mouth.position.set(0, -0.019, 0.006);
  muzzle.add(patch, leftNostril, rightNostril, mouth);
  root.add(muzzle);

  root.traverse((child) => {
    if (child instanceof THREE.Mesh) resources.add(child.geometry);
  });
  return { root, dispose: () => resources.forEach((item) => item.dispose()) };
}

export function ColorUnicornLabViewer({ variant }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<ColorControls | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.body.set(variant.bodySwatch);
    controls.horn.set(variant.hornSwatch);
    controls.invalidate();
  }, [variant]);

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

      const currentHost = hostRef.current;
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.35 : 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.domElement.className = "color-dog-viewer__canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.touchAction = "none";
      renderer.domElement.dataset.modelUrl = MODEL_URL;
      currentHost.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf3eee9);
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camera.position.set(0, 0.12, 7.15);
      camera.lookAt(0, 0.02, 0);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environmentTexture = pmrem.fromScene(room, 0.04).texture;
      scene.environment = environmentTexture;
      room.dispose();
      pmrem.dispose();
      scene.add(new THREE.HemisphereLight(0xffffff, 0x806f67, 1.85));
      const key = new THREE.DirectionalLight(0xfffaf5, 2.25);
      key.position.set(-4.5, 6.5, 7);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffddd2, 0.65);
      fill.position.set(5, 2.2, 4);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xd8e9ff, 0.75);
      rim.position.set(4, 3.5, -5);
      scene.add(rim);

      let needsRender = true;
      const liveControls: ColorControls = {
        body: new THREE.Color(variant.bodySwatch),
        horn: new THREE.Color(variant.hornSwatch),
        invalidate: () => { needsRender = true; }
      };
      controlsRef.current = liveControls;

      const model = gltf.scene;
      const bodyMaterials: import("three").MeshStandardMaterial[] = [];
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.91,
          metalness: 0,
          envMapIntensity: 0.34
        });
        applyCleanColorZones(material, liveControls);
        child.material = material;
        bodyMaterials.push(material);
      });

      const faceDetails = createFaceDetails(THREE);
      const showFaceDetails = !new URLSearchParams(window.location.search).has("plain");
      if (showFaceDetails) model.add(faceDetails.root);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scale = 3.0 / Math.max(size.y, 0.001);
      model.scale.setScalar(scale);
      model.position.set(-center.x * scale, -center.y * scale - 0.03, -center.z * scale);

      const stage = new THREE.Group();
      stage.rotation.y = -0.18;
      stage.add(model);
      scene.add(stage);

      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.18, 56),
        new THREE.MeshBasicMaterial({ color: 0x3d2e29, transparent: true, opacity: 0.13, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(0, -1.72, 0.12);
      shadow.scale.y = 0.5;
      scene.add(shadow);

      let dragging = false;
      let primaryPointer = -1;
      let previousX = 0;
      let previousY = 0;
      let targetRotationX = -0.03;
      let targetRotationY = -0.18;
      let rotationX = targetRotationX;
      let rotationY = targetRotationY;
      let zoom = 7.15;
      let targetZoom = zoom;
      let idleUntil = performance.now() + 4200;
      const pointers = new Map<number, { x: number; y: number }>();
      let pinchDistance = 0;

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
          if (pinchDistance > 0) targetZoom = THREE.MathUtils.clamp(targetZoom - (distance - pinchDistance) * 0.012, 5.9, 8.8);
          pinchDistance = distance;
        } else if (dragging && event.pointerId === primaryPointer) {
          targetRotationY += (event.clientX - previousX) * 0.0095;
          targetRotationX = THREE.MathUtils.clamp(targetRotationX + (event.clientY - previousY) * 0.006, -0.3, 0.27);
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
        targetZoom = THREE.MathUtils.clamp(targetZoom + event.deltaY * 0.004, 5.9, 8.8);
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
        model.remove(faceDetails.root);
        faceDetails.dispose();
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) child.geometry.dispose();
        });
        bodyMaterials.forEach((material) => material.dispose());
        shadow.geometry.dispose();
        (shadow.material as import("three").Material).dispose();
        environmentTexture.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    }

    setup().catch((error) => {
      console.error("[ColorUnicornLabViewer] clean unicorn load failed", error);
      if (!cancelled) setStatus("error");
    });
    return () => { cancelled = true; dispose(); };
  }, [retryKey]);

  return (
    <div className="color-dog-viewer color-unicorn-viewer" role="group" aria-label={`${variant.name} 3D 独角兽`}>
      <div ref={hostRef} className="color-dog-viewer__host" />
      <div className="color-unicorn-viewer__palette" aria-label="当前随机配色">
        <span style={{ background: variant.bodySwatch }} /><span style={{ background: variant.hornSwatch }} />
        <strong>{variant.name}</strong>
      </div>
      {status === "ready" ? <div className="color-unicorn-viewer__hint"><Rotate3D size={15} />拖动 360° 查看 · 双指缩放</div> : null}
      {status !== "ready" ? (
        <div className={`color-dog-viewer__status color-dog-viewer__status--${status}`} role="status">
          {status === "loading" ? <><span className="color-dog-viewer__spinner" /><strong>正在加载双翼独角兽</strong><span>{progress}%</span></> : <><strong>3D 加载失败</strong><button type="button" onClick={() => setRetryKey((value) => value + 1)}>重新尝试</button></>}
        </div>
      ) : null}
    </div>
  );
}