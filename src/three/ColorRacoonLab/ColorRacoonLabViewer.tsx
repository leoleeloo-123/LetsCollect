import { Rotate3D } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "../ToyViewer/runtime";

export type RacoonTanghuluVariant = {
  id: string;
  name: string;
  swatch: string;
};

type Props = { variant: RacoonTanghuluVariant; showZones: boolean };
type Status = "loading" | "ready" | "error";
type TanghuluControls = {
  color: import("three").Color;
  debugMode: { value: number };
  invalidate: () => void;
};

const MODEL_URL = "/models/toys/color-racoon/model-mobile-v001.glb";
const MASK_URL = "/models/toys/color-racoon/tanghulu-mask-mobile-v001.webp?v=1";

function colorizeTanghulu(
  material: import("three").Material,
  tanghuluColor: import("three").Color,
  candyMask: import("three").Texture,
  debugMode: { value: number }
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.racoonCandyMask = { value: candyMask };
    shader.uniforms.racoonTanghuluColor = { value: tanghuluColor };
    shader.uniforms.racoonDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vRacoonObjectPosition;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vRacoonObjectPosition = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D racoonCandyMask;
uniform vec3 racoonTanghuluColor;
uniform float racoonDebugMode;
varying vec3 vRacoonObjectPosition;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float candyCandidate = smoothstep(0.06, 0.38, texture2D(racoonCandyMask, vMapUv).r);
  float candySide = 1.0 - step(-0.2658, vRacoonObjectPosition.x);
  float candyHeight = smoothstep(-0.330, -0.312, vRacoonObjectPosition.y)
    * (1.0 - smoothstep(0.568, 0.586, vRacoonObjectPosition.y));
  float candyDepth = smoothstep(0.150, 0.165, vRacoonObjectPosition.z)
    * (1.0 - smoothstep(0.450, 0.466, vRacoonObjectPosition.z));
  float tanghuluDetail = candyCandidate * candySide * candyHeight * candyDepth;

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float candyShading = mix(0.48, 1.08, smoothstep(0.04, 0.92, baseLuma));
  vec3 colorizedTanghulu = racoonTanghuluColor * candyShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedTanghulu, tanghuluDetail);

  vec3 zoneColor = mix(
    vec3(0.10, 0.43, 0.37),
    vec3(0.14, 0.27, 0.78),
    tanghuluDetail
  );
  sampledDiffuseColor.rgb = mix(resultColor, zoneColor, racoonDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-racoon-tanghulu-v1";
  material.needsUpdate = true;
}
export function ColorRacoonLabViewer({ variant, showZones }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<TanghuluControls | null>(null);
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
      const compact = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760;
      const [{ THREE }, RoomEnvironment, gltf] = await Promise.all([
        loadToyViewerRuntime(),
        loadRoomEnvironment(),
        loadToyModel(MODEL_URL, (loaded, total) => {
          if (!cancelled && total > 0) setProgress(Math.min(100, Math.round((loaded / total) * 100)));
        })
      ]);
      if (cancelled || !hostRef.current) return;

      const candyMask = await new THREE.TextureLoader().loadAsync(MASK_URL);
      candyMask.flipY = false;
      candyMask.colorSpace = THREE.NoColorSpace;
      candyMask.wrapS = THREE.RepeatWrapping;
      candyMask.wrapT = THREE.RepeatWrapping;
      candyMask.generateMipmaps = false;
      candyMask.minFilter = THREE.LinearFilter;

      const currentHost = hostRef.current;
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.35 : 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.domElement.className = "color-animal-viewer__canvas";
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

      scene.add(new THREE.HemisphereLight(0xffffff, 0x81726b, 1.95));
      const key = new THREE.DirectionalLight(0xfffbf7, 1.6);
      key.position.set(-4.5, 6.2, 7);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffe2d6, 0.34);
      fill.position.set(5.2, 2.5, 4.5);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xdceaff, 0.3);
      rim.position.set(4, 3.5, -5);
      scene.add(rim);

      let needsRender = true;
      const rotationParam = new URLSearchParams(window.location.search).get("rotation");
      const rotationValue = rotationParam === null ? Number.NaN : Number(rotationParam);
      const inspectionRotation = Number.isFinite(rotationValue)
        ? THREE.MathUtils.clamp(rotationValue, -Math.PI, Math.PI)
        : null;
      const controls: TanghuluControls = {
        color: new THREE.Color(variantRef.current.swatch).multiplyScalar(0.92),
        debugMode: { value: showZonesRef.current ? 1 : 0 },
        invalidate: () => { needsRender = true; }
      };
      controlsRef.current = controls;

      const model = gltf.scene;
      const materials: import("three").Material[] = [];
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const originals = Array.isArray(child.material) ? child.material : [child.material];
        const clones = originals.map((item) => {
          const clone = item.clone();
          if (clone instanceof THREE.MeshStandardMaterial) {
            clone.metalness = 0;
            clone.roughness = 1;
            clone.envMapIntensity = 0.1;
            clone.metalnessMap = null;
            clone.roughnessMap = null;
            if (clone.normalMap) clone.normalScale.setScalar(0.42);
            if (clone.map) {
              clone.map.generateMipmaps = false;
              clone.map.minFilter = THREE.LinearFilter;
              clone.map.magFilter = THREE.LinearFilter;
              clone.map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
              clone.map.needsUpdate = true;
            }
          }
          colorizeTanghulu(clone, controls.color, candyMask, controls.debugMode);
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
      stage.rotation.y = inspectionRotation ?? -0.24;
      stage.add(model);
      scene.add(stage);

      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.15, 52),
        new THREE.MeshBasicMaterial({ color: 0x3d2e29, transparent: true, opacity: 0.13, depthWrite: false })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.set(0, -1.64, 0.1);
      shadow.scale.y = 0.48;
      scene.add(shadow);

      let dragging = false;
      let primaryPointer = -1;
      let previousX = 0;
      let previousY = 0;
      let targetRotationX = -0.025;
      let targetRotationY = inspectionRotation ?? -0.24;
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
          if (pinchDistance > 0) targetZoom = THREE.MathUtils.clamp(targetZoom - (distance - pinchDistance) * 0.012, 5.2, 8.2);
          pinchDistance = distance;
        } else if (dragging && event.pointerId === primaryPointer) {
          targetRotationY += (event.clientX - previousX) * 0.0095;
          targetRotationX = THREE.MathUtils.clamp(targetRotationX + (event.clientY - previousY) * 0.006, -0.28, 0.24);
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
        targetZoom = THREE.MathUtils.clamp(targetZoom + event.deltaY * 0.004, 5.2, 8.2);
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
        const autoRotate = inspectionRotation === null
          && !reducedMotion
          && !dragging
          && time < idleUntil;
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
        candyMask.dispose();
        environmentTexture.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    }

    setup().catch((error) => {
      console.error("[ColorRacoonLabViewer] color racoon load failed", error);
      if (!cancelled) setStatus("error");
    });
    return () => { cancelled = true; dispose(); };
  }, [retryKey]);

  return (
    <div className="color-animal-viewer color-animal-viewer--single color-racoon-viewer" role="group" aria-label={`${variant.name} 3D Racoon`}>
      <div ref={hostRef} className="color-animal-viewer__host" />
      <div className="color-animal-single__palette" aria-label="当前糖葫芦颜色">
        <span style={{ background: variant.swatch }} /><strong>{showZones ? "保护区检查" : variant.name}</strong>
      </div>
      {status === "ready" ? <div className="color-animal-single__hint"><Rotate3D size={15} />拖动 360° 查看 · 双指缩放</div> : null}
      {status !== "ready" ? (
        <div className={`color-animal-viewer__status color-animal-viewer__status--${status}`} role="status">
          {status === "loading" ? <><span className="color-animal-viewer__spinner" /><strong>正在加载 Color Racoon</strong><span>{progress}%</span></> : <><strong>3D 加载失败</strong><button type="button" onClick={() => setRetryKey((value) => value + 1)}>重新尝试</button></>}
        </div>
      ) : null}
    </div>
  );
}