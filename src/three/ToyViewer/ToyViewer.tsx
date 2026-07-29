import { useEffect, useRef, useState } from "react";
import { Rotate3D } from "lucide-react";
import { ToyThumbnail } from "../../components/toys/ToyThumbnail";
import { getToyModel, getToyPalette } from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";
import {
  createToyMaterial,
  getCollectibleRenderTraits
} from "../material/createToyMaterial";
import {
  cloneColorBunnyMaterials,
  prepareColorBunnyProtectTexture
} from "../material/createColorBunnyMaterials";
import { cloneColorCatYarnMaterials } from "../material/createColorCatYarnMaterials";
import {
  cloneColorPandaMaterials,
  prepareColorPandaProtectTexture
} from "../material/createColorPandaMaterials";
import { cloneColorOtterMaterials } from "../material/createColorOtterMaterials";
import {
  cloneColorBearSingerMaterials,
  prepareColorBearSingerMaskTexture
} from "../material/createColorBearSingerMaterials";
import {
  cloneColorDogCameraMaterials,
  prepareColorDogCameraMaskTexture
} from "../material/createColorDogCameraMaterials";
import { cloneColorDogDrumMaterials } from "../material/createColorDogDrumMaterials";
import {
  cloneColorSealMaterials,
  prepareColorSealMaskTexture,
  prepareColorSealObjectMaskTexture
} from "../material/createColorSealMaterials";
import {
  cloneColorKarpyMaterials,
  prepareColorKarpyMaskTexture
} from "../material/createColorKarpyMaterials";
import {
  cloneColorKoalaMaterials,
  prepareColorKoalaMaskTexture
} from "../material/createColorKoalaMaterials";
import {
  isColorAccessoryRendering,
  prepareColorAccessoryModel
} from "../material/prepareColorAccessoryModel";
import { loadRoomEnvironment, loadToyModel, loadToyViewerRuntime } from "./runtime";

export type ToyRotationController = {
  getRotation: () => number;
  subscribe: (listener: () => void) => () => void;
};

type ToyViewerProps = {
  toy: Collectible;
  variant?: "hero" | "stage" | "inspect" | "tile";
  interactive?: boolean;
  autoRotate?: "intro" | "continuous" | "off";
  active?: boolean;
  rotationController?: ToyRotationController;
  className?: string;
  materialProfile?: "auto" | "compact";
};

type ViewerStatus = "loading" | "ready" | "error";

const TILE_MODEL_TARGET_HEIGHT = 3.70;
const TILE_INITIAL_PIXEL_RATIO_CAP = 1.05;
const TILE_SETTLED_PIXEL_RATIO_CAP = 1.75;
export function ToyViewer({
  toy,
  variant = "stage",
  interactive = true,
  autoRotate = "intro",
  active = true,
  rotationController,
  className = "",
  materialProfile = "auto"
}: ToyViewerProps) {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const inViewportRef = useRef(true);
  const [status, setStatus] = useState<ViewerStatus>("loading");
  const [progress, setProgress] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const modelDefinition = getToyModel(toy.modelId);
  const palette = getToyPalette(toy.paletteId);
  const fallbackModelUrl = modelDefinition.assets.modelUrl ?? modelDefinition.assets.mobileModelUrl;

  useEffect(() => {
    activeRef.current = active && inViewportRef.current;
  }, [active]);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      inViewportRef.current = entry.isIntersecting;
      activeRef.current = active && entry.isIntersecting;
    }, { rootMargin: "80px" });
    observer.observe(host);
    return () => observer.disconnect();
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
      const isTile = variant === "tile";
      const isDiamondUnicorn = toy.modelId === "diamond-unicorn";
      const useLightweightStage = materialProfile === "compact" || isTile || (isCompactDevice && variant !== "inspect");
      const materialLightScale = toy.materialId === "glass" ? 0.5 : 1;
      const materialExposure = toy.materialId === "glass" ? 0.82 : 1.12;
      const resolvedModelUrl = isCompactDevice
        ? modelDefinition.assets.mobileModelUrl ?? availableModelUrl
        : modelDefinition.assets.modelUrl ?? availableModelUrl;
      const needsEnvironment = !isTile && (!useLightweightStage || toy.materialId !== "jade");
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
      const initialPixelRatioCap = isTile ? TILE_INITIAL_PIXEL_RATIO_CAP : useLightweightStage ? 1.15 : isCompactDevice ? 1.25 : 1.5;
      const settledPixelRatioCap = isTile ? TILE_SETTLED_PIXEL_RATIO_CAP : useLightweightStage ? 1.5 : isCompactDevice ? 1.6 : 1.75;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, initialPixelRatioCap));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = materialExposure;
      renderer.domElement.className = "toy-viewer__canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.dataset.modelUrl = resolvedModelUrl;
      currentHost.replaceChildren(renderer.domElement);

      const scene = new THREE.Scene();
      const diamondBackdropResources: Array<{
        geometry: import("three").BufferGeometry;
        material: import("three").Material;
      }> = [];
      if (isDiamondUnicorn) {
        scene.background = new THREE.Color(0xe4eae7);
        const backdropGeometry = new THREE.PlaneGeometry(12, 9);
        const backdropMaterial = new THREE.MeshBasicMaterial({ color: 0xdce4e1 });
        const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
        backdrop.position.z = -3.6;
        scene.add(backdrop);
        diamondBackdropResources.push({ geometry: backdropGeometry, material: backdropMaterial });

        const accentGeometryLeft = new THREE.PlaneGeometry(2.35, 9);
        const accentMaterialLeft = new THREE.MeshBasicMaterial({ color: 0xc8dedc });
        const accentLeft = new THREE.Mesh(accentGeometryLeft, accentMaterialLeft);
        accentLeft.position.set(-3.35, 0.1, -3.5);
        accentLeft.rotation.z = -0.08;
        scene.add(accentLeft);
        diamondBackdropResources.push({ geometry: accentGeometryLeft, material: accentMaterialLeft });

        const accentGeometryRight = new THREE.PlaneGeometry(2.35, 9);
        const accentMaterialRight = new THREE.MeshBasicMaterial({ color: 0xe6d2db });
        const accentRight = new THREE.Mesh(accentGeometryRight, accentMaterialRight);
        accentRight.position.set(3.35, -0.12, -3.48);
        accentRight.rotation.z = 0.09;
        scene.add(accentRight);
        diamondBackdropResources.push({ geometry: accentGeometryRight, material: accentMaterialRight });
      }
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, variant === "tile" ? 0.48 : 0.72, variant === "inspect" ? 7.35 : variant === "hero" ? 6.85 : variant === "tile" ? 7.35 : 8.05);
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

      // Model-specific materials preserve authored details and recolor only approved zones.
      const colorBunnyBag = modelDefinition.rendering?.mode === "color-bunny-bag"
        ? modelDefinition.rendering
        : null;
      const colorCatYarn = modelDefinition.rendering?.mode === "color-cat-yarn"
        ? modelDefinition.rendering
        : null;
      const colorPandaHat = modelDefinition.rendering?.mode === "color-panda-hat"
        ? modelDefinition.rendering
        : null;
      const colorOtterLollipop = modelDefinition.rendering?.mode === "color-otter-lollipop"
        ? modelDefinition.rendering
        : null;
      const colorBearSingerAfro = modelDefinition.rendering?.mode === "color-bear-singer-afro"
        ? modelDefinition.rendering
        : null;
      const colorDogCameraAccessories = modelDefinition.rendering?.mode === "color-dog-camera-accessories"
        ? modelDefinition.rendering
        : null;
      const colorDogDrum = modelDefinition.rendering?.mode === "color-dog-drum"
        ? modelDefinition.rendering
        : null;
      const colorSealStarfish = modelDefinition.rendering?.mode === "color-seal-starfish"
        ? modelDefinition.rendering
        : null;
      const colorKarpyHat = modelDefinition.rendering?.mode === "color-karpy-hat"
        ? modelDefinition.rendering
        : null;
      const colorKoalaHat = modelDefinition.rendering?.mode === "color-koala-hat"
        ? modelDefinition.rendering
        : null;
      const colorAccessoryRendering = isColorAccessoryRendering(
        modelDefinition.rendering
      )
        ? modelDefinition.rendering
        : null;
      const standardMaterialResult = colorBunnyBag
        || colorCatYarn
        || colorPandaHat
        || colorOtterLollipop
        || colorBearSingerAfro
        || colorDogCameraAccessories
        || colorDogDrum
        || colorSealStarfish
        || colorKarpyHat
        || colorKoalaHat
        || colorAccessoryRendering
        ? null
        : createToyMaterial(THREE, toy, { lightweight: useLightweightStage });
      const toyMaterial = standardMaterialResult?.material ?? null;
      const glowColor = standardMaterialResult?.glowColor ?? new THREE.Color(palette.glow);
      const colorBunnyProtectMap = colorBunnyBag
        ? prepareColorBunnyProtectTexture(
            THREE,
            await new THREE.TextureLoader().loadAsync(colorBunnyBag.protectMaskUrl)
          )
        : null;
      const colorPandaProtectMap = colorPandaHat
        ? prepareColorPandaProtectTexture(
            THREE,
            await new THREE.TextureLoader().loadAsync(colorPandaHat.protectMaskUrl)
          )
        : null;
      const colorBearSingerMask = colorBearSingerAfro
        ? await new THREE.TextureLoader().loadAsync(colorBearSingerAfro.maskUrl)
        : null;
      if (colorBearSingerMask) {
        prepareColorBearSingerMaskTexture(THREE, colorBearSingerMask);
      }
      const colorDogCameraMask = colorDogCameraAccessories
        ? await new THREE.TextureLoader().loadAsync(colorDogCameraAccessories.maskUrl)
        : null;
      if (colorDogCameraMask) {
        prepareColorDogCameraMaskTexture(THREE, colorDogCameraMask);
      }
      const colorSealMasks = colorSealStarfish
        ? await Promise.all([
            new THREE.TextureLoader().loadAsync(colorSealStarfish.maskUrl),
            new THREE.TextureLoader().loadAsync(colorSealStarfish.objectMaskUrl)
          ])
        : null;
      const colorSealMask = colorSealMasks?.[0] ?? null;
      const colorSealObjectMask = colorSealMasks?.[1] ?? null;
      if (colorSealMask && colorSealObjectMask) {
        prepareColorSealMaskTexture(THREE, colorSealMask);
        prepareColorSealObjectMaskTexture(THREE, colorSealObjectMask);
      }
      const colorKarpyMask = colorKarpyHat
        ? await new THREE.TextureLoader().loadAsync(colorKarpyHat.maskUrl)
        : null;
      if (colorKarpyMask) {
        prepareColorKarpyMaskTexture(THREE, colorKarpyMask);
      }
      const colorKoalaMask = colorKoalaHat
        ? await new THREE.TextureLoader().loadAsync(colorKoalaHat.maskUrl)
        : null;
      if (colorKoalaMask) {
        prepareColorKoalaMaskTexture(THREE, colorKoalaMask);
      }
      let colorBunnyMaterials: import("three").Material[] = [];
      let colorCatMaterials: import("three").Material[] = [];
      let colorPandaMaterials: import("three").Material[] = [];
      let colorOtterMaterials: import("three").Material[] = [];
      let colorBearSingerMaterials: import("three").Material[] = [];
      let colorDogCameraMaterials: import("three").Material[] = [];
      let colorDogDrumMaterials: import("three").Material[] = [];
      let colorSealMaterials: import("three").Material[] = [];
      let colorKarpyMaterials: import("three").Material[] = [];
      let colorKoalaMaterials: import("three").Material[] = [];
      let colorAccessoryMaterials: import("three").Material[] = [];
      let colorAccessoryTextures: import("three").Texture[] = [];
      const tileTextureCopies: import("three").Texture[] = [];
      const tileTextureCache = new Map<import("three").Texture, import("three").Texture>();
      function applyTileMaterialProfile(materials: import("three").Material[]) {
        if (!isTile) return;
        materials.forEach((material) => {
          if (!(material instanceof THREE.MeshStandardMaterial)) return;
          material.normalMap = null;
          material.roughness = 1;
          material.envMapIntensity = Math.min(material.envMapIntensity, 0.05);
          if (!material.map) {
            material.needsUpdate = true;
            return;
          }
          let tileMap = tileTextureCache.get(material.map);
          if (!tileMap) {
            tileMap = material.map.clone();
            // The mobile atlases have black gutters with very little UV padding.
            // Mipmaps blend those gutters into the islands at thumbnail sizes,
            // which reads as dark seams across the toy. Linear sampling keeps
            // the homepage tiles clean without changing larger viewer variants.
            tileMap.generateMipmaps = false;
            tileMap.minFilter = THREE.LinearFilter;
            tileMap.magFilter = THREE.LinearFilter;
            tileMap.anisotropy = 1;
            tileMap.needsUpdate = true;
            tileTextureCache.set(material.map, tileMap);
            tileTextureCopies.push(tileMap);
          }
          material.map = tileMap;
          material.needsUpdate = true;
        });
      }

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
      if (variant !== "hero" && variant !== "tile") scene.add(pedestal);

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
      if (variant !== "hero" && variant !== "tile") scene.add(contactShadow);

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
      if (variant !== "hero" && variant !== "tile") scene.add(glowRing);
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
        colorBunnyMaterials.forEach((material) => material.dispose());
        colorCatMaterials.forEach((material) => material.dispose());
        colorPandaMaterials.forEach((material) => material.dispose());
        colorOtterMaterials.forEach((material) => material.dispose());
        colorBearSingerMaterials.forEach((material) => material.dispose());
        colorDogCameraMaterials.forEach((material) => material.dispose());
        colorDogDrumMaterials.forEach((material) => material.dispose());
        colorSealMaterials.forEach((material) => material.dispose());
        colorKarpyMaterials.forEach((material) => material.dispose());
        colorKoalaMaterials.forEach((material) => material.dispose());
        colorAccessoryMaterials.forEach((material) => material.dispose());
        colorAccessoryTextures.forEach((texture) => texture.dispose());
        tileTextureCopies.forEach((texture) => texture.dispose());
        colorBunnyProtectMap?.dispose();
        colorPandaProtectMap?.dispose();
        colorBearSingerMask?.dispose();
        colorDogCameraMask?.dispose();
        colorSealMask?.dispose();
        colorSealObjectMask?.dispose();
        colorKarpyMask?.dispose();
        colorKoalaMask?.dispose();
        environmentTexture?.dispose();
        diamondBackdropResources.forEach(({ geometry, material }) => {
          geometry.dispose();
          material.dispose();
        });
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
      if (colorAccessoryRendering) {
        const preparedAccessory = await prepareColorAccessoryModel(
          THREE,
          renderer,
          model,
          colorAccessoryRendering,
          palette.color
        );
        colorAccessoryMaterials = preparedAccessory.materials;
        colorAccessoryTextures = preparedAccessory.textures;
      } else if (colorBunnyBag && colorBunnyProtectMap) {
        colorBunnyMaterials = cloneColorBunnyMaterials(
          THREE,
          model,
          new THREE.Color(palette.color).multiplyScalar(colorBunnyBag.bagColorScale),
          colorBunnyProtectMap,
          renderer.capabilities.getMaxAnisotropy()
        );
      } else if (colorCatYarn) {
        colorCatMaterials = cloneColorCatYarnMaterials(
          THREE,
          model,
          new THREE.Color(palette.color).multiplyScalar(colorCatYarn.yarnColorScale),
          colorCatYarn.materialName,
          renderer.capabilities.getMaxAnisotropy()
        );
      } else if (colorPandaHat && colorPandaProtectMap) {
        colorPandaMaterials = cloneColorPandaMaterials(
          THREE,
          model,
          new THREE.Color(palette.color).multiplyScalar(colorPandaHat.hatColorScale),
          colorPandaProtectMap,
          renderer.capabilities.getMaxAnisotropy()
        );
      } else if (colorOtterLollipop) {
        colorOtterMaterials = cloneColorOtterMaterials(
          THREE,
          model,
          new THREE.Color(palette.color).multiplyScalar(colorOtterLollipop.lollipopColorScale),
          colorOtterLollipop.materialName,
          renderer.capabilities.getMaxAnisotropy()
        );
      } else if (colorBearSingerAfro && colorBearSingerMask) {
        colorBearSingerMaterials = cloneColorBearSingerMaterials(
          THREE,
          model,
          new THREE.Color(palette.color).multiplyScalar(colorBearSingerAfro.colorScale),
          colorBearSingerMask,
          renderer.capabilities.getMaxAnisotropy()
        );
      } else if (colorDogCameraAccessories && colorDogCameraMask) {
        colorDogCameraMaterials = cloneColorDogCameraMaterials(
          THREE,
          model,
          new THREE.Color(palette.color).multiplyScalar(colorDogCameraAccessories.colorScale),
          colorDogCameraMask,
          renderer.capabilities.getMaxAnisotropy()
        );
      } else if (colorDogDrum) {
        colorDogDrumMaterials = cloneColorDogDrumMaterials(
          THREE,
          model,
          new THREE.Color(palette.color).multiplyScalar(colorDogDrum.drumColorScale),
          renderer.capabilities.getMaxAnisotropy()
        );
      } else if (colorSealStarfish && colorSealMask && colorSealObjectMask) {
        colorSealMaterials = cloneColorSealMaterials(
          THREE,
          model,
          new THREE.Color(palette.color).multiplyScalar(colorSealStarfish.colorScale),
          colorSealMask,
          colorSealObjectMask,
          renderer.capabilities.getMaxAnisotropy()
        );
      } else if (colorKarpyHat && colorKarpyMask) {
        colorKarpyMaterials = cloneColorKarpyMaterials(
          THREE,
          model,
          new THREE.Color(palette.color).multiplyScalar(colorKarpyHat.colorScale),
          colorKarpyMask,
          renderer.capabilities.getMaxAnisotropy()
        );
      } else if (colorKoalaHat && colorKoalaMask) {
        colorKoalaMaterials = cloneColorKoalaMaterials(
          THREE,
          model,
          new THREE.Color(palette.color).multiplyScalar(colorKoalaHat.hatColorScale),
          colorKoalaMask,
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

      applyTileMaterialProfile([
        ...colorBunnyMaterials,
        ...colorCatMaterials,
        ...colorPandaMaterials,
        ...colorOtterMaterials,
        ...colorBearSingerMaterials,
        ...colorDogCameraMaterials,
        ...colorDogDrumMaterials,
        ...colorSealMaterials,
        ...colorKarpyMaterials,
        ...colorKoalaMaterials,
        ...colorAccessoryMaterials,
        ...(toyMaterial ? [toyMaterial] : [])
      ]);

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const targetHeight = variant === "inspect" ? 3.55 : variant === "tile" ? TILE_MODEL_TARGET_HEIGHT : 3.34;
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
      let targetRotationY = rotationController?.getRotation() ?? (-0.2 + (toy.appearanceSeed % 11) * 0.12);
      let currentRotationX = targetRotationX;
      let currentRotationY = targetRotationY;
      let lastRenderTime = 0;
      let needsRender = true;
      let idleUntil = performance.now() + 3200;
      const unsubscribeRotation = rotationController?.subscribe(() => {
        needsRender = true;
      }) ?? (() => {});
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
        if (rotationController) targetRotationY = rotationController.getRotation();
        const rotationSettling = Math.abs(currentRotationY - targetRotationY) > 0.0005;
        const idleRotating = !rotationController
          && !reducedMotion
          && autoRotate !== "off"
          && (autoRotate === "continuous" || time < idleUntil);
        if (!dragging && !idleRotating && !needsRender && !rotationSettling) return;

        const targetFrameTime = dragging ? 1000 / 60 : 1000 / (variant === "tile" ? 20 : 30);
        if (time - lastRenderTime < targetFrameTime) return;
        const delta = Math.min(clock.getDelta(), 0.05);
        lastRenderTime = time;

        if (!dragging && idleRotating) {
          targetRotationY += delta * (autoRotate === "continuous" ? 0.095 : 0.16);
        }
        currentRotationX = THREE.MathUtils.lerp(currentRotationX, targetRotationX, 0.1);
        currentRotationY = THREE.MathUtils.lerp(currentRotationY, targetRotationY, rotationController ? 0.2 : 0.1);
        toyGroup.rotation.x = currentRotationX;
        toyGroup.rotation.y = currentRotationY;
        glowRing.rotation.z += delta * 0.16;
        underGlow.intensity = baseUnderGlow + Math.abs(Math.sin(currentRotationY)) * (0.22 + glow * 0.62);
        if (toyMaterial) {
          toyMaterial.emissiveIntensity = baseEmissive + Math.abs(Math.sin(currentRotationY)) * (0.008 + glow * 0.026);
        }
        mixer?.update(delta);
        renderer.render(scene, camera);
        needsRender = rotationController
          ? Math.abs(currentRotationY - targetRotationY) > 0.0005
          : false;

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
        unsubscribeRotation();
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
    rotationController,
    materialProfile,
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
      {status === "loading" && variant !== "tile" ? (
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
