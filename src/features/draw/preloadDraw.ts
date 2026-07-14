import { featuredToy } from "../../data/mock/toys";
import { preloadToyViewer } from "../../three/ToyViewer";

export function preloadDrawExperience() {
  const isCompactDevice = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760;
  const modelUrl = isCompactDevice
    ? featuredToy.assets.mobileModelUrl ?? featuredToy.assets.modelUrl
    : featuredToy.assets.modelUrl ?? featuredToy.assets.mobileModelUrl;
  if (modelUrl) void preloadToyViewer(modelUrl);
}
