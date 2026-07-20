import { Rotate3D } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "../ToyViewer/runtime";

export type BunnyBagVariant = {
  id: string;
  name: string;
  swatch: string;
};

type Props = { variant: BunnyBagVariant; showZones: boolean };
type Status = "loading" | "ready" | "error";
type BagControls = {
  color: import("three").Color;
  debugMode: { value: number };
  invalidate: () => void;
};

const MODEL_URL = "/models/toys/color-bunny/model-mobile-v001.glb";
const PROTECT_MASK_URL = "/models/toys/color-bunny/protect-mask-mobile-v001.webp";

function colorizeBag(
  material: import("three").Material,
  bagColor: import("three").Color,
  protectMap: import("three").Texture,
  debugMode: { value: number }
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.bunnyProtectMap = { value: protectMap };
    shader.uniforms.bunnyBagColor = { value: bagColor };
    shader.uniforms.bunnyDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vBunnyObjectPosition;
varying vec3 vBunnyObjectNormal;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vBunnyObjectPosition = position;
vBunnyObjectNormal = normal;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D bunnyProtectMap;
uniform vec3 bunnyBagColor;
uniform float bunnyDebugMode;
varying vec3 vBunnyObjectPosition;
varying vec3 vBunnyObjectNormal;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec2 maskChannels = texture2D(bunnyProtectMap, vMapUv).rg;
  float warmCandidate = smoothstep(0.16, 0.68, maskChannels.r);
  float darkCandidate = smoothstep(0.18, 0.66, maskChannels.g);

  float bagFront = smoothstep(0.22, 0.34, vBunnyObjectPosition.z);
  float caseX = 1.0 - smoothstep(0.165, 0.235, abs(vBunnyObjectPosition.x));
  float caseY = smoothstep(-0.635, -0.565, vBunnyObjectPosition.y)
    * (1.0 - smoothstep(-0.285, -0.225, vBunnyObjectPosition.y));
  float handleX = 1.0 - smoothstep(0.135, 0.205, abs(vBunnyObjectPosition.x));
  float handleY = smoothstep(-0.390, -0.325, vBunnyObjectPosition.y)
    * (1.0 - smoothstep(-0.105, -0.055, vBunnyObjectPosition.y));
  float bagGeometry = max(caseX * caseY, handleX * handleY) * bagFront;
  float casePanelX = 1.0 - smoothstep(0.158, 0.164, abs(vBunnyObjectPosition.x));
  float casePanelY = smoothstep(-0.582, -0.574, vBunnyObjectPosition.y)
    * (1.0 - smoothstep(-0.368, -0.360, vBunnyObjectPosition.y));
  float casePanelDepth = smoothstep(0.405, 0.414, vBunnyObjectPosition.z);
  float casePanelNormal = smoothstep(0.92, 0.97, vBunnyObjectNormal.z);
  float casePanel = casePanelX * casePanelY * casePanelDepth * casePanelNormal;
  float bagDetail = max(warmCandidate * bagGeometry, casePanel);

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float bagShading = mix(0.58, 1.0, smoothstep(0.10, 0.88, baseLuma));
  bagShading = mix(bagShading, 0.88, casePanel);
  vec3 colorizedBag = bunnyBagColor * bagShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedBag, bagDetail);

  vec3 bunnyPosition = vBunnyObjectPosition;
  vec2 leftEyePoint = vec2(
    (bunnyPosition.x + 0.19) / 0.075,
    (bunnyPosition.y - 0.255) / 0.11
  );
  vec2 rightEyePoint = vec2(
    (bunnyPosition.x - 0.20) / 0.075,
    (bunnyPosition.y - 0.255) / 0.11
  );
  float leftEyeGate = 1.0 - smoothstep(0.76, 1.0, dot(leftEyePoint, leftEyePoint));
  float rightEyeGate = 1.0 - smoothstep(0.76, 1.0, dot(rightEyePoint, rightEyePoint));
  float eyeGate = max(leftEyeGate, rightEyeGate) * smoothstep(0.22, 0.27, bunnyPosition.z);

  vec2 muzzlePoint = vec2(
    bunnyPosition.x / 0.11,
    (bunnyPosition.y - 0.16) / 0.105
  );
  float muzzleGate = (1.0 - smoothstep(0.76, 1.0, dot(muzzlePoint, muzzlePoint)))
    * smoothstep(0.28, 0.34, bunnyPosition.z);

  float cheekX = smoothstep(0.15, 0.20, abs(bunnyPosition.x))
    * (1.0 - smoothstep(0.34, 0.39, abs(bunnyPosition.x)));
  float cheekY = smoothstep(0.04, 0.10, bunnyPosition.y)
    * (1.0 - smoothstep(0.22, 0.27, bunnyPosition.y));
  float cheekGate = cheekX * cheekY * smoothstep(0.16, 0.24, bunnyPosition.z);
  float innerEarGate = smoothstep(0.42, 0.52, bunnyPosition.y);

  float fixedWarm = warmCandidate * max(innerEarGate, cheekGate);
  float fixedDark = darkCandidate * max(eyeGate, muzzleGate);
  vec3 zoneColor = vec3(0.10, 0.43, 0.37);
  zoneColor = mix(zoneColor, vec3(0.76, 0.16, 0.34), fixedWarm);
  zoneColor = mix(zoneColor, vec3(0.78, 0.26, 0.08), fixedDark);
  zoneColor = mix(zoneColor, vec3(0.14, 0.27, 0.78), bagDetail);
  sampledDiffuseColor.rgb = mix(resultColor, zoneColor, bunnyDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-bunny-bag-v4";
  material.needsUpdate = true;
}
export function ColorBunnyLabViewer({ variant, showZones }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<BagControls | null>(null);
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

      const protectMap = await new THREE.TextureLoader().loadAsync(PROTECT_MASK_URL);
      protectMap.flipY = false;
      protectMap.colorSpace = THREE.NoColorSpace;
      protectMap.wrapS = THREE.RepeatWrapping;
      protectMap.wrapT = THREE.RepeatWrapping;
      protectMap.generateMipmaps = false;
      protectMap.minFilter = THREE.LinearFilter;

      const currentHost = hostRef.current;
      const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, compact ? 1.35 : 1.6));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
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
      const controls: BagControls = {
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
          colorizeBag(clone, controls.color, protectMap, controls.debugMode);
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
      stage.rotation.y = -0.24;
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
      let targetRotationY = -0.24;
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
        protectMap.dispose();
        environmentTexture.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    }

    setup().catch((error) => {
      console.error("[ColorBunnyLabViewer] color bunny load failed", error);
      if (!cancelled) setStatus("error");
    });
    return () => { cancelled = true; dispose(); };
  }, [retryKey]);

  return (
    <div className="color-dog-viewer color-dog-viewer--single color-bunny-viewer" role="group" aria-label={`${variant.name} 3D 小兔`}>
      <div ref={hostRef} className="color-dog-viewer__host" />
      <div className="color-dog-single__palette" aria-label="当前包包颜色">
        <span style={{ background: variant.swatch }} /><strong>{showZones ? "保护区检查" : variant.name}</strong>
      </div>
      {status === "ready" ? <div className="color-dog-single__hint"><Rotate3D size={15} />拖动 360° 查看 · 双指缩放</div> : null}
      {status !== "ready" ? (
        <div className={`color-dog-viewer__status color-dog-viewer__status--${status}`} role="status">
          {status === "loading" ? <><span className="color-dog-viewer__spinner" /><strong>正在加载 Color Bunny</strong><span>{progress}%</span></> : <><strong>3D 加载失败</strong><button type="button" onClick={() => setRetryKey((value) => value + 1)}>重新尝试</button></>}
        </div>
      ) : null}
    </div>
  );
}