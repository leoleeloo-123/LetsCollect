import { useEffect, useRef, useState } from "react";
import { Rotate3D } from "lucide-react";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { getColorBirdAccentPalette, getToyModel, getToyPalette } from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";
import {
  createToyMaterial,
  getCollectibleRenderTraits
} from "../material/createToyMaterial";
import {
  cloneProtectedCoatMaterials,
  prepareProtectedCoatTexture
} from "../material/createProtectedCoatMaterial";
import {
  cloneColorBirdMaterials,
  prepareColorBirdZoneTexture
} from "../material/createColorBirdMaterials";
import {
  cloneColorTeddyMaterials,
  prepareColorTeddyProtectTexture
} from "../material/createColorTeddyMaterials";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "./runtime";

type ToyViewerProps = {
  toy: Collectible;
  variant?: "hero" | "stage" | "inspect";
  interactive?: boolean;
  autoRotate?: "intro" | "continuous" | "off";
  active?: boolean;
  className?: string;
};

type ViewerStatus = "loading" | "ready" | "error";

export function ToyViewer({
  toy,
  variant = "stage",
  interactive = true,
  autoRotate = "intro",
  active = true,
  className = ""
}: ToyViewerProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const [status, setStatus] = useState<ViewerStatus>("loading");
  const [progress, setProgress] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const modelDefinition = getToyModel(toy.modelId);
  const palette = getToyPalette(toy.paletteId);
  const fallbackModelUrl = modelDefinition.assets.modelUrl ?? modelDefinition.assets.mobileModelUrl;

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host || !fallbackModelUrl) {
      setStatus("error");
      return;
    }
    const availableModelUrl = fallbackModelUrl;

    let cancelled = false;
    let disposeViewer = () => {};
    setStatus("loading");
    setProgress(0);

    async function setupViewer() {
      const timingEnabled = import.meta.env.DEV || new URLSearchParams(window.location.search).has("debug3d");
      const timingStart = performance.now();
      const timings: Record<string, number> = {};
      const recordTiming = (name: string) => {
        if (timingEnabled) timings[name] = Math.round((performance.now() - timingStart) * 10) / 10;
      };

      const isCompactDevice = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760;
      const useLightweightStage = isCompactDevice && variant !== "inspect";
      const materialLightScale = toy.materialId === "glass" ? 0.5 : 1;
      const materialExposure = toy.materialId === "glass" ? 0.82 : 1.12;
      const resolvedModelUrl = isCompactDevice
        ? modelDefinition.assets.mobileModelUrl ?? availableModelUrl
        : modelDefinition.assets.modelUrl ?? availableModelUrl;
      const needsEnvironment = !useLightweightStage || toy.materialId !== "jade";
      const [{ THREE }, RoomEnvironment] = await Promise.all([
        loadToyViewerRuntime(),
        needsEnvironment ? loadRoomEnvironment() : Promise.resolve(null)
      ]);
      recordTiming("modules-ready");

      if (cancelled || !canvasHostRef.current) return;

      const currentHost = canvasHostRef.current;
      const { hydration, luster, glow } = getCollectibleRenderTraits(toy);
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      const initialPixelRatioCap = useLightweightStage ? 1.15 : isCompactDevice ? 1.25 : 1.5;
      const settledPixelRatioCap = useLightweightStage ? 1.5 : isCompactDevice ? 1.6 : 1.75;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, initialPixelRatioCap));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = materialExposure;
      renderer.domElement.className = "toy-viewer__canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.dataset.modelUrl = resolvedModelUrl;
      currentHost.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 0.72, variant === "inspect" ? 7.35 : variant === "hero" ? 6.85 : 8.05);
      camera.lookAt(0, 0.08, 0);

      let environmentTexture: import("three").Texture | null = null;
      if (RoomEnvironment) {
        const pmrem = new THREE.PMREMGenerator(renderer);
        const roomEnvironment = new RoomEnvironment();
        environmentTexture = pmrem.fromScene(roomEnvironment, 0.025).texture;
        scene.environment = environmentTexture;
        roomEnvironment.dispose();
        pmrem.dispose();
      }

      const toyGroup = new THREE.Group();
      toyGroup.position.y = 0.08 + modelDefinition.viewer.yOffset;
      scene.add(toyGroup);

      // Protected color models retain their authored facial texture and recolor only the coat.
      const protectedCoat = modelDefinition.rendering?.mode === "protected-coat"
        ? modelDefinition.rendering
        : null;
      const colorBirdZones = modelDefinition.rendering?.mode === "color-bird-zones"
        ? modelDefinition.rendering
        : null;
      const colorTeddyCoat = modelDefinition.rendering?.mode === "color-teddy-coat"
        ? modelDefinition.rendering
        : null;
      const standardMaterialResult = protectedCoat || colorBirdZones || colorTeddyCoat
        ? null
        : createToyMaterial(THREE, toy, { lightweight: useLightweightStage });
      const toyMaterial = standardMaterialResult?.material ?? null;
      const glowColor = standardMaterialResult?.glowColor ?? new THREE.Color(palette.glow);
      const protectMap = protectedCoat
        ? prepareProtectedCoatTexture(
            THREE,
            await new THREE.TextureLoader().loadAsync(protectedCoat.protectMaskUrl)
          )
        : null;
      const colorBirdZoneMap = colorBirdZones
        ? prepareColorBirdZoneTexture(
            THREE,
            await new THREE.TextureLoader().loadAsync(colorBirdZones.zoneMaskUrl)
          )
        : null;
      const colorTeddyProtectMap = colorTeddyCoat
        ? prepareColorTeddyProtectTexture(
            THREE,
            await new THREE.TextureLoader().loadAsync(colorTeddyCoat.protectMaskUrl)
          )
        : null;
      let protectedMaterials: import("three").Material[] = [];
      let colorBirdMaterials: import("three").Material[] = [];
      let colorTeddyMaterials: import("three").Material[] = [];

      scene.add(new THREE.HemisphereLight(0xffffff, palette.attenuation, (1.9 + hydration * 0.4) * materialLightScale));

      const keyLight = new THREE.DirectionalLight(0xffffff, (2.6 + luster * 0.9) * materialLightScale);
      keyLight.position.set(-3.8, 5.1, 4.5);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(glowColor, (1.7 + glow * 1.8) * materialLightScale);
      rimLight.position.set(4.1, 2.5, -3.2);
      scene.add(rimLight);

      if (!useLightweightStage) {
        const fillLight = new THREE.PointLight(0xffffff, 1.05 * materialLightScale, 9);
        fillLight.position.set(0, 2.1, 3.5);
        scene.add(fillLight);
      }

      const baseUnderGlow = 1.8 + glow * 2.6;
      const baseEmissive = 0.012 + glow * 0.075;
      const underGlow = new THREE.PointLight(glowColor, baseUnderGlow, 5.2);
      underGlow.position.set(0, -1.7, 0.25);
      scene.add(underGlow);

      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(1.55, 1.78, 0.07, useLightweightStage ? 36 : 72),
        new THREE.MeshPhysicalMaterial({
          color: 0xf4eee9,
          roughness: 0.35,
          clearcoat: 0.55,
          transparent: true,
          opacity: 0.52
        })
      );
      pedestal.position.set(0, -1.83, 0);
      pedestal.scale.set(1.12, 1, 0.65);
      if (variant !== "hero") scene.add(pedestal);

      const contactShadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.9, useLightweightStage ? 36 : 72),
        new THREE.MeshBasicMaterial({
          color: 0x17352c,
          transparent: true,
          opacity: 0.17,
          depthWrite: false
        })
      );
      contactShadow.rotation.x = -Math.PI / 2;
      contactShadow.position.set(0, -1.88, 0.16);
      contactShadow.scale.set(1.1, 0.52, 1);
      if (variant !== "hero") scene.add(contactShadow);

      const glowRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.42, 0.012, 8, useLightweightStage ? 48 : 96),
        new THREE.MeshBasicMaterial({
          color: glowColor,
          transparent: true,
          opacity: 0.16 + glow * 0.34,
          blending: THREE.AdditiveBlending
        })
      );
      glowRing.position.set(0, -1.77, 0);
      glowRing.rotation.x = Math.PI / 2;
      if (variant !== "hero") scene.add(glowRing);
      recordTiming("scene-ready");

      let mixer: import("three").AnimationMixer | null = null;
      const clock = new THREE.Clock();
      let staticResourcesDisposed = false;

      function disposeObject(root: import("three").Object3D) {
        root.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.geometry.dispose();
        });
      }

      function disposeStaticResources() {
        if (staticResourcesDisposed) return;
        staticResourcesDisposed = true;
        toyMaterial?.dispose();
        protectedMaterials.forEach((material) => material.dispose());
        colorBirdMaterials.forEach((material) => material.dispose());
        colorTeddyMaterials.forEach((material) => material.dispose());
        protectMap?.dispose();
        colorBirdZoneMap?.dispose();
        colorTeddyProtectMap?.dispose();
        environmentTexture?.dispose();
        pedestal.geometry.dispose();
        (pedestal.material as import("three").Material).dispose();
        contactShadow.geometry.dispose();
        (contactShadow.material as import("three").Material).dispose();
        glowRing.geometry.dispose();
        (glowRing.material as import("three").Material).dispose();
        renderer.dispose();
        renderer.domElement.remove();
      }

      disposeViewer = disposeStaticResources;

      const gltf = await loadToyModel(resolvedModelUrl, (loaded, total) => {
        if (!cancelled && total > 0) {
          setProgress(Math.min(100, Math.round((loaded / total) * 100)));
        }
      });
      recordTiming("model-ready");

      if (cancelled) {
        disposeObject(gltf.scene);
        disposeStaticResources();
        return;
      }

      const model = gltf.scene;
      model.rotation.y = modelDefinition.viewer.rotationY;
      if (protectedCoat && protectMap) {
        const coatColor = new THREE.Color(palette.color).multiplyScalar(protectedCoat.coatColorScale);
        protectedMaterials = cloneProtectedCoatMaterials(
          THREE,
          model,
          coatColor,
          protectMap,
          renderer.capabilities.getMaxAnisotropy()
        );
      } else if (colorBirdZones && colorBirdZoneMap) {
        const accentPalette = getColorBirdAccentPalette(toy.paletteId, toy.appearanceSeed);
        colorBirdMaterials = cloneColorBirdMaterials(
          THREE,
          model,
          {
            body: new THREE.Color(palette.color).multiplyScalar(colorBirdZones.bodyColorScale),
            cap: new THREE.Color(accentPalette.color).multiplyScalar(colorBirdZones.capColorScale),
            blush: new THREE.Color(colorBirdZones.blushColor),
            feet: new THREE.Color(colorBirdZones.feetColor)
          },
          colorBirdZoneMap,
          renderer.capabilities.getMaxAnisotropy()
        );
      } else if (colorTeddyCoat && colorTeddyProtectMap) {
        colorTeddyMaterials = cloneColorTeddyMaterials(
          THREE,
          model,
          new THREE.Color(palette.color).multiplyScalar(colorTeddyCoat.coatColorScale),
          colorTeddyProtectMap,
          renderer.capabilities.getMaxAnisotropy()
        );
      } else {
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh) || !toyMaterial) return;
          child.material = toyMaterial;
          child.castShadow = false;
          child.receiveShadow = false;
        });
      }

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const targetHeight = variant === "inspect" ? 3.55 : 3.34;
      const scaleFactor = (targetHeight * modelDefinition.viewer.scaleMultiplier) / Math.max(size.y, 0.001);
      model.scale.setScalar(scaleFactor);
      model.position.set(-center.x * scaleFactor, -center.y * scaleFactor, -center.z * scaleFactor);
      toyGroup.add(model);

      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => mixer?.clipAction(clip).play());
      }

      if (!cancelled) {
        setProgress(100);
        setStatus("ready");
      }

      let frameId = 0;
      let clarityUpgradeTimer = 0;
      let firstFrameRendered = false;
      let dragging = false;
      let pointerId = -1;
      let previousX = 0;
      let previousY = 0;
      let targetRotationX = -0.02;
      let targetRotationY = -0.2;
      let currentRotationX = targetRotationX;
      let currentRotationY = targetRotationY;
      let lastRenderTime = 0;
      let needsRender = true;
      let idleUntil = performance.now() + 3200;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function handlePointerDown(event: PointerEvent) {
        if (!interactive) return;
        dragging = true;
        pointerId = event.pointerId;
        previousX = event.clientX;
        previousY = event.clientY;
        needsRender = true;
        idleUntil = performance.now() + 3200;
        renderer.domElement.setPointerCapture(event.pointerId);
        renderer.domElement.classList.add("is-dragging");
      }

      function handlePointerMove(event: PointerEvent) {
        if (!dragging || event.pointerId !== pointerId) return;
        const deltaX = event.clientX - previousX;
        const deltaY = event.clientY - previousY;
        previousX = event.clientX;
        previousY = event.clientY;
        targetRotationY += deltaX * 0.009;
        targetRotationX = THREE.MathUtils.clamp(targetRotationX + deltaY * 0.006, -0.34, 0.3);
        needsRender = true;
        idleUntil = performance.now() + 3200;
      }

      function finishDrag(event: PointerEvent) {
        if (event.pointerId !== pointerId) return;
        dragging = false;
        pointerId = -1;
        idleUntil = performance.now() + 3200;
        renderer.domElement.classList.remove("is-dragging");
      }

      renderer.domElement.addEventListener("pointerdown", handlePointerDown);
      renderer.domElement.addEventListener("pointermove", handlePointerMove);
      renderer.domElement.addEventListener("pointerup", finishDrag);
      renderer.domElement.addEventListener("pointercancel", finishDrag);

      function resize() {
        const width = Math.max(currentHost.clientWidth, 1);
        const height = Math.max(currentHost.clientHeight, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        needsRender = true;
      }

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(currentHost);
      resize();

      function render(time: number) {
        frameId = window.requestAnimationFrame(render);
        if (cancelled || document.hidden || !activeRef.current) return;
        const idleRotating = !reducedMotion
          && autoRotate !== "off"
          && (autoRotate === "continuous" || time < idleUntil);
        if (!dragging && !idleRotating && !needsRender) return;

        const targetFrameTime = dragging ? 1000 / 60 : 1000 / 30;
        if (time - lastRenderTime < targetFrameTime) return;
        const delta = Math.min(clock.getDelta(), 0.05);
        lastRenderTime = time;

        if (!dragging && idleRotating) {
          targetRotationY += delta * (autoRotate === "continuous" ? 0.095 : 0.16);
        }
        currentRotationX = THREE.MathUtils.lerp(currentRotationX, targetRotationX, 0.1);
        currentRotationY = THREE.MathUtils.lerp(currentRotationY, targetRotationY, 0.1);
        toyGroup.rotation.x = currentRotationX;
        toyGroup.rotation.y = currentRotationY;
        glowRing.rotation.z += delta * 0.16;
        underGlow.intensity = baseUnderGlow + Math.abs(Math.sin(currentRotationY)) * (0.22 + glow * 0.62);
        if (toyMaterial) {
          toyMaterial.emissiveIntensity = baseEmissive + Math.abs(Math.sin(currentRotationY)) * (0.008 + glow * 0.026);
        }
        mixer?.update(delta);
        renderer.render(scene, camera);
        needsRender = false;

        if (!firstFrameRendered) {
          firstFrameRendered = true;
          recordTiming("first-frame");
          if (timingEnabled) {
            console.table({
              modules: timings["modules-ready"],
              scene: timings["scene-ready"] - timings["modules-ready"],
              model: timings["model-ready"] - timings["scene-ready"],
              firstFrame: timings["first-frame"] - timings["model-ready"],
              total: timings["first-frame"]
            });
          }

          // Paint quickly at a conservative DPR, then sharpen the settled frame.
          clarityUpgradeTimer = window.setTimeout(() => {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, settledPixelRatioCap));
            resize();
          }, 120);
        }
      }

      frameId = window.requestAnimationFrame(render);

      disposeViewer = () => {
        window.cancelAnimationFrame(frameId);
        window.clearTimeout(clarityUpgradeTimer);
        resizeObserver.disconnect();
        renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
        renderer.domElement.removeEventListener("pointermove", handlePointerMove);
        renderer.domElement.removeEventListener("pointerup", finishDrag);
        renderer.domElement.removeEventListener("pointercancel", finishDrag);
        mixer?.stopAllAction();
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) child.geometry.dispose();
        });
        disposeStaticResources();
      };
    }

    setupViewer().catch((error) => {
      disposeViewer();
      console.error("[ToyViewer] 模型加载失败", error);
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      disposeViewer();
    };
  }, [
    fallbackModelUrl,
    autoRotate,
    interactive,
    modelDefinition,
    palette,
    retryKey,
    toy.appearance.colorDepth,
    toy.appearance.glow,
    toy.appearance.hydration,
    toy.appearance.luster,
    toy.appearance.transparency,
    toy.materialId,
    toy.materialTraits.brilliance,
    toy.materialTraits.character,
    toy.materialTraits.craftsmanship,
    toy.materialTraits.finish,
    toy.materialTraits.purity,
    toy.appearanceSeed,
    variant
  ]);

  return (
    <div
      className={`toy-viewer toy-viewer--${variant}${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={`${toy.name} 3D 模型`}
      data-status={status}
    >
      <div className="toy-viewer__canvas-host" ref={canvasHostRef} />
      {status === "loading" ? (
        <div className="toy-viewer__status" role="status">
          <div className="toy-viewer__poster" aria-hidden="true">
            <ToyThumbnail toy={toy} size="large" cacheOnly />
          </div>
          <span className="toy-viewer__spinner" aria-hidden="true" />
          <strong>正在唤醒{modelDefinition.name}</strong>
          <span>{progress > 0 ? `${progress}%` : "准备 3D 场景"}</span>
        </div>
      ) : null}
      {status === "error" ? (
        <div className="toy-viewer__status toy-viewer__status--error" role="alert">
          <strong>3D 模型暂时没有加载成功</strong>
          <button type="button" onClick={() => setRetryKey((value) => value + 1)}>重新加载</button>
        </div>
      ) : null}
      {status === "ready" && interactive ? (
        <span className="toy-viewer__hint"><Rotate3D size={14} /> 拖动查看 3D</span>
      ) : null}
    </div>
  );
}
