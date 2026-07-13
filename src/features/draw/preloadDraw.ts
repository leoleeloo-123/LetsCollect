import { featuredToy } from "../../data/mock/toys";
import { preloadToyViewer } from "../../three/ToyViewer";

export function preloadDrawExperience() {
  const modelUrl = featuredToy.assets.mobileModelUrl ?? featuredToy.assets.modelUrl;
  if (modelUrl) void preloadToyViewer(modelUrl);
}
