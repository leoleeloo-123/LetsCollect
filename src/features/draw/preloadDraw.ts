import { featuredToy } from "../../data/mock/toys";
import { getToyModel, toyModels } from "../toys/catalog";
import { preloadToyViewer } from "../../three/ToyViewer";

let poolPreloadScheduled = false;

type NetworkInformation = {
  saveData?: boolean;
};

async function preloadCompactModelPool() {
  for (const model of toyModels) {
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
  if (!isCompactDevice || connection?.saveData || poolPreloadScheduled) return;
  poolPreloadScheduled = true;

  const run = () => void preloadCompactModelPool();
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number })
      .requestIdleCallback(run, { timeout: 1200 });
  } else {
    globalThis.setTimeout(run, 320);
  }
}
