import { featuredToy } from "../../data/mock/toys";
import { colorAnimalModels, getToyModel } from "../toys/catalog";
import { preloadToyViewer } from "../../three/ToyViewer";

let poolPreloadScheduled = false;

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

async function preloadDesktopModelPool() {
  for (const model of colorAnimalModels) {
    await preloadToyViewer(model.assets.mobileModelUrl);
  }
}

export function preloadDrawExperience() {
  const isCompactDevice = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760;
  const featuredModel = getToyModel(featuredToy.modelId);
  const modelUrl = isCompactDevice
    ? featuredModel.assets.mobileModelUrl
    : featuredModel.assets.modelUrl;
  void preloadToyViewer(modelUrl);

  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  const constrainedNetwork = connection?.saveData
    || connection?.effectiveType === "slow-2g"
    || connection?.effectiveType === "2g"
    || connection?.effectiveType === "3g";

  // Mobile loads only the visible model. Preloading the full GLB pool used to spend
  // several megabytes before a visitor had even opened the draw page.
  if (isCompactDevice || constrainedNetwork || poolPreloadScheduled) return;
  poolPreloadScheduled = true;

  const run = () => void preloadDesktopModelPool();
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number })
      .requestIdleCallback(run, { timeout: 1800 });
  } else {
    globalThis.setTimeout(run, 800);
  }
}