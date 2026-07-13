import { useEffect, useRef, useState } from "react";
import { Rotate3D } from "lucide-react";
import type { Toy } from "../../types/toy";

type ToyViewerProps = {
  toy: Toy;
  variant?: "hero" | "stage" | "inspect";
  interactive?: boolean;
  active?: boolean;
  className?: string;
};

type ViewerStatus = "loading" | "ready" | "error";

const paletteMaterials = {
  rose: { color: "#ff789e", attenuation: "#8f2346", emissive: "#c83464", glow: "#ff7da5" },
  mint: { color: "#78d9b7", attenuation: "#145f4b", emissive: "#29936f", glow: "#78e6bf" },
  honey: { color: "#efbd5f", attenuation: "#85500d", emissive: "#b67a1f", glow: "#ffd279" },
  ice: { color: "#83d5e8", attenuation: "#2c6b86", emissive: "#3b94b0", glow: "#92e5f5" },
  emerald: { color: "#24966f", attenuation: "#063e2d", emissive: "#0e6d4d", glow: "#45d89a" },
  lavender: { color: "#b69add", attenuation: "#58447c", emissive: "#8063aa", glow: "#cbb0f0" }
} as const;

function getMaterialPalette(palette: string) {
  return paletteMaterials[palette as keyof typeof paletteMaterials] ?? paletteMaterials.rose;
}

export function ToyViewer({
  toy,
  variant = "stage",
  interactive = true,
  active = true,
  className = ""
}: ToyViewerProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const [status, setStatus] = useState<ViewerStatus>("loading");
  const [progress, setProgress] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const modelUrl = toy.assets.mobileModelUrl ?? toy.assets.modelUrl;

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host || !modelUrl) {
      setStatus("error");
      return;
    }
    const resolvedModelUrl = modelUrl;

    let cancelled = false;
    let disposeViewer = () => {};
    setStatus("loading");
    setProgress(0);

    async function setupViewer() {
      const THREE = await import("three");
      const [{ GLTFLoader }, { DRACOLoader }, { RoomEnvironment }] = await Promise.all([
        import("three/examples/jsm/loaders/GLTFLoader.js"),
        import("three/examples/jsm/loaders/DRACOLoader.js"),
        import("three/examples/jsm/environments/RoomEnvironment.js")
      ]);

      if (cancelled || !canvasHostRef.current) return;

      const currentHost = canvasHostRef.current;
      const materialPalette = getMaterialPalette(toy.palette);
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1.25 : 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      renderer.domElement.className = "toy-viewer__canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      currentHost.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 0.72, variant === "inspect" ? 7.35 : 8.05);
      camera.lookAt(0, 0.08, 0);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const roomEnvironment = new RoomEnvironment();
      const environmentTexture = pmrem.fromScene(roomEnvironment, 0.025).texture;
      scene.environment = environmentTexture;
      roomEnvironment.dispose();
      pmrem.dispose();

      const toyGroup = new THREE.Group();
      toyGroup.position.y = 0.08;
      scene.add(toyGroup);

      const jadeMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(materialPalette.color),
        roughness: 0.1,
        metalness: 0,
        transmission: 0.7,
        thickness: 4.3,
        ior: 1.49,
        transparent: true,
        opacity: 0.76,
        clearcoat: 1,
        clearcoatRoughness: 0.035,
        attenuationColor: new THREE.Color(materialPalette.attenuation),
        attenuationDistance: 2.8,
        emissive: new THREE.Color(materialPalette.emissive),
        emissiveIntensity: 0.055,
        specularIntensity: 1,
        envMapIntensity: 1.45
      });

      scene.add(new THREE.HemisphereLight(0xffffff, materialPalette.attenuation, 2.1));

      const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
      keyLight.position.set(-3.8, 5.1, 4.5);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(materialPalette.glow, 2.7);
      rimLight.position.set(4.1, 2.5, -3.2);
      scene.add(rimLight);

      const fillLight = new THREE.PointLight(0xffffff, 1.05, 9);
      fillLight.position.set(0, 2.1, 3.5);
      scene.add(fillLight);

      const underGlow = new THREE.PointLight(materialPalette.glow, 3.2, 5.2);
      underGlow.position.set(0, -1.7, 0.25);
      scene.add(underGlow);

      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(1.55, 1.78, 0.07, 72),
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
      scene.add(pedestal);

      const contactShadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.9, 72),
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
      scene.add(contactShadow);

      const glowRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.42, 0.012, 10, 96),
        new THREE.MeshBasicMaterial({
          color: materialPalette.glow,
          transparent: true,
          opacity: 0.38,
          blending: THREE.AdditiveBlending
        })
      );
      glowRing.position.set(0, -1.77, 0);
      glowRing.rotation.x = Math.PI / 2;
      scene.add(glowRing);

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/draco/");
      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);

      let mixer: import("three").AnimationMixer | null = null;
      const clock = new THREE.Clock();
      const originalMaterials = new Set<import("three").Material>();
      let staticResourcesDisposed = false;

      function disposeObject(root: import("three").Object3D) {
        root.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            Object.values(material).forEach((value) => {
              if (value instanceof THREE.Texture) value.dispose();
            });
            material.dispose();
          });
        });
      }

      function disposeStaticResources() {
        if (staticResourcesDisposed) return;
        staticResourcesDisposed = true;
        dracoLoader.dispose();
        jadeMaterial.dispose();
        environmentTexture.dispose();
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

      const gltf = await gltfLoader.loadAsync(resolvedModelUrl, (event) => {
        if (!cancelled && event.total > 0) {
          setProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
        }
      });

      if (cancelled) {
        disposeObject(gltf.scene);
        disposeStaticResources();
        return;
      }

      const model = gltf.scene;
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => originalMaterials.add(material));
        child.material = jadeMaterial;
        child.castShadow = false;
        child.receiveShadow = false;
      });

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const targetHeight = variant === "inspect" ? 3.55 : 3.34;
      const scaleFactor = targetHeight / Math.max(size.y, 0.001);
      model.scale.setScalar(scaleFactor);
      model.position.set(-center.x * scaleFactor, -center.y * scaleFactor, -center.z * scaleFactor);
      toyGroup.add(model);

      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => mixer?.clipAction(clip).play());
      }

      originalMaterials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) value.dispose();
        });
        material.dispose();
      });
      dracoLoader.dispose();
      if (!cancelled) {
        setProgress(100);
        setStatus("ready");
      }

      let frameId = 0;
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
        const idleRotating = !reducedMotion && time < idleUntil;
        if (!dragging && !idleRotating && !needsRender) return;

        const targetFrameTime = dragging ? 1000 / 60 : 1000 / 30;
        if (time - lastRenderTime < targetFrameTime) return;
        const delta = Math.min(clock.getDelta(), 0.05);
        lastRenderTime = time;

        if (!dragging && idleRotating) targetRotationY += delta * 0.16;
        currentRotationX = THREE.MathUtils.lerp(currentRotationX, targetRotationX, 0.1);
        currentRotationY = THREE.MathUtils.lerp(currentRotationY, targetRotationY, 0.1);
        toyGroup.rotation.x = currentRotationX;
        toyGroup.rotation.y = currentRotationY;
        glowRing.rotation.z += delta * 0.16;
        underGlow.intensity = 3.05 + Math.abs(Math.sin(currentRotationY)) * 0.75;
        jadeMaterial.emissiveIntensity = 0.05 + Math.abs(Math.sin(currentRotationY)) * 0.035;
        mixer?.update(delta);
        renderer.render(scene, camera);
        needsRender = false;
      }

      frameId = window.requestAnimationFrame(render);

      disposeViewer = () => {
        window.cancelAnimationFrame(frameId);
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
  }, [interactive, modelUrl, retryKey, toy.palette, variant]);

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
          <span className="toy-viewer__spinner" aria-hidden="true" />
          <strong>正在唤醒独角兽</strong>
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
