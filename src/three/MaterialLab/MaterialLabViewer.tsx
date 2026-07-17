import { useEffect, useRef, useState } from "react";
import { getToyModel } from "../../features/toys/catalog";
import type { ToyModelId } from "../../types/toy";
import {
  createPrototypeMaterial,
  materialPrototypes
} from "../material/materialPrototypes";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "../ToyViewer/runtime";

type MaterialLabViewerProps = {
  modelId: ToyModelId;
};

type LabStatus = "loading" | "ready" | "error";

export function MaterialLabViewer({ modelId }: MaterialLabViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<LabStatus>("loading");
  const [progress, setProgress] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const modelDefinition = getToyModel(modelId);
    const isCompact = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760;
    const modelUrl = isCompact
      ? modelDefinition.assets.mobileModelUrl
      : modelDefinition.assets.modelUrl;
    let cancelled = false;
    let dispose = () => {};

    setStatus("loading");
    setProgress(0);

    async function setup() {
      const [{ THREE }, RoomEnvironment, gltf] = await Promise.all([
        loadToyViewerRuntime(),
        loadRoomEnvironment(),
        loadToyModel(modelUrl, (loaded, total) => {
          if (!cancelled && total > 0) setProgress(Math.min(100, Math.round((loaded / total) * 100)));
        })
      ]);
      if (cancelled || !hostRef.current) {
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) child.geometry.dispose();
        });
        return;
      }

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompact ? 1.1 : 1.35));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.domElement.className = "material-lab-viewer__canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      hostRef.current.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xe8eeea);
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 40);
      camera.position.set(0, 0, 14);
      camera.lookAt(0, 0, 0);

      const pmrem = new THREE.PMREMGenerator(renderer);
      const roomEnvironment = new RoomEnvironment();
      const environmentTexture = pmrem.fromScene(roomEnvironment, 0.03).texture;
      scene.environment = environmentTexture;
      roomEnvironment.dispose();
      pmrem.dispose();

      scene.add(new THREE.HemisphereLight(0xffffff, 0x50615b, 1.45));
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
      keyLight.position.set(-5, 7, 8);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0xbde4df, 2.2);
      rimLight.position.set(6, 3, -5);
      scene.add(rimLight);

      const sourceModel = gltf.scene;
      const box = new THREE.Box3().setFromObject(sourceModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const scaleFactor = (isCompact ? 2.05 : 2.25) / Math.max(size.y, 0.001);

      const materials = materialPrototypes.map(({ id, swatch }) =>
        createPrototypeMaterial(THREE, id, { tint: swatch })
      );
      const panelGeometry = new THREE.PlaneGeometry(2.82, 3.02);
      const shadowGeometry = new THREE.CircleGeometry(0.92, 36);
      const panelMaterials = [
        new THREE.MeshBasicMaterial({ color: 0xf4f6f4 }),
        new THREE.MeshBasicMaterial({ color: 0xe3e9e5 })
      ];
      const shadowMaterial = new THREE.MeshBasicMaterial({
        color: 0x17352c,
        transparent: true,
        opacity: 0.14,
        depthWrite: false
      });
      const cells: import("three").Group[] = [];
      const rotatingModels: import("three").Object3D[] = [];

      materialPrototypes.forEach((_, index) => {
        const cell = new THREE.Group();
        const panel = new THREE.Mesh(panelGeometry, panelMaterials[index % 2]);
        panel.position.z = -1.55;
        cell.add(panel);

        const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadow.position.set(0, -1.02, -0.72);
        shadow.scale.y = 0.22;
        cell.add(shadow);

        const model = sourceModel.clone(true);
        model.scale.setScalar(scaleFactor);
        model.position.set(
          -center.x * scaleFactor,
          -center.y * scaleFactor + 0.12,
          -center.z * scaleFactor
        );
        model.rotation.y = -0.3;
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.material = materials[index];
          child.castShadow = false;
          child.receiveShadow = false;
        });
        cell.add(model);
        cells.push(cell);
        rotatingModels.push(model);
        scene.add(cell);
      });

      function layout(width: number, height: number) {
        const columns = width < 700 ? 2 : 4;
        const rows = Math.ceil(cells.length / columns);
        const cellWidth = 3.02;
        const cellHeight = 3.24;
        cells.forEach((cell, index) => {
          const column = index % columns;
          const row = Math.floor(index / columns);
          cell.position.set(
            (column - (columns - 1) / 2) * cellWidth,
            ((rows - 1) / 2 - row) * cellHeight,
            0
          );
        });

        const worldWidth = columns * cellWidth;
        const worldHeight = rows * cellHeight;
        const viewportAspect = width / Math.max(height, 1);
        const gridAspect = worldWidth / worldHeight;
        const padding = 0.2;
        if (viewportAspect > gridAspect) {
          camera.top = worldHeight / 2 + padding;
          camera.bottom = -camera.top;
          camera.right = camera.top * viewportAspect;
          camera.left = -camera.right;
        } else {
          camera.right = worldWidth / 2 + padding;
          camera.left = -camera.right;
          camera.top = camera.right / viewportAspect;
          camera.bottom = -camera.top;
        }
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      }

      const resizeObserver = new ResizeObserver(([entry]) => {
        if (!entry) return;
        layout(Math.max(1, entry.contentRect.width), Math.max(1, entry.contentRect.height));
      });
      resizeObserver.observe(hostRef.current);
      layout(hostRef.current.clientWidth, hostRef.current.clientHeight);

      const clock = new THREE.Clock();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let frameId = 0;
      let lastRenderTime = 0;
      const frameInterval = isCompact ? 1000 / 24 : 1000 / 30;

      function render(time: number) {
        frameId = window.requestAnimationFrame(render);
        if (document.hidden || time - lastRenderTime < frameInterval) return;
        lastRenderTime = time;
        if (!reducedMotion) {
          const rotation = -0.3 + clock.getElapsedTime() * 0.17;
          rotatingModels.forEach((model) => {
            model.rotation.y = rotation;
          });
        }
        renderer.render(scene, camera);
      }

      renderer.compile(scene, camera);
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
      setProgress(100);
      setStatus("ready");

      dispose = () => {
        window.cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        sourceModel.traverse((child) => {
          if (child instanceof THREE.Mesh) child.geometry.dispose();
        });
        materials.forEach((material) => material.dispose());
        panelGeometry.dispose();
        shadowGeometry.dispose();
        panelMaterials.forEach((material) => material.dispose());
        shadowMaterial.dispose();
        environmentTexture.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    }

    setup().catch((error) => {
      console.error("[MaterialLabViewer] 材质实验室加载失败", error);
      if (!cancelled) setStatus("error");
    });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [modelId, retryKey]);

  return (
    <div className="material-lab-viewer">
      <div ref={hostRef} className="material-lab-viewer__host" />
      <div className="material-lab-viewer__labels" aria-hidden="true">
        {materialPrototypes.map((material) => (
          <div className="material-lab-viewer__label" key={material.id}>
            <span style={{ background: material.swatch }} />
            <strong>{material.name}</strong>
            {material.fidelity === "approximate" ? <small>概念</small> : null}
          </div>
        ))}
      </div>
      {status !== "ready" ? (
        <div className={`material-lab-viewer__status material-lab-viewer__status--${status}`} role="status">
          {status === "loading" ? (
            <>
              <span className="material-lab-viewer__spinner" aria-hidden="true" />
              <strong>正在装配材质样本</strong>
              <span>{progress}%</span>
            </>
          ) : (
            <>
              <strong>3D 样本加载失败</strong>
              <button type="button" onClick={() => setRetryKey((value) => value + 1)}>重新加载</button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
