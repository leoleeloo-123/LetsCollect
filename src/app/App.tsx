import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { RequireProfile } from "../features/auth/RequireProfile";

const CollectionPage = lazy(() => import("../pages/collection/CollectionPage").then((module) => ({ default: module.CollectionPage })));
const DrawPage = lazy(() => import("../pages/draw/DrawPage").then((module) => ({ default: module.DrawPage })));
const HomePage = lazy(() => import("../pages/home/HomePage").then((module) => ({ default: module.HomePage })));
const OnboardingPage = lazy(() => import("../pages/auth/OnboardingPage").then((module) => ({ default: module.OnboardingPage })));
const EchoPage = lazy(() => import("../pages/echo/EchoPage").then((module) => ({ default: module.EchoPage })));
const AgentConsolePage = lazy(() => import("../pages/agent/AgentConsolePage").then((module) => ({ default: module.AgentConsolePage })));

const ColorBunnyLabPage = lazy(() => import("../pages/color-bunny-lab/ColorBunnyLabPage").then((module) => ({ default: module.ColorBunnyLabPage })));
const ColorPandaLabPage = lazy(() => import("../pages/color-panda-lab/ColorPandaLabPage").then((module) => ({ default: module.ColorPandaLabPage })));
const ColorOtterLabPage = lazy(() => import("../pages/color-otter-lab/ColorOtterLabPage").then((module) => ({ default: module.ColorOtterLabPage })));
const ColorOwlLabPage = lazy(() => import("../pages/color-owl-lab/ColorOwlLabPage").then((module) => ({ default: module.ColorOwlLabPage })));
const ColorDuckLabPage = lazy(() => import("../pages/color-duck-lab/ColorDuckLabPage").then((module) => ({ default: module.ColorDuckLabPage })));
const ColorBirdLabPage = lazy(() => import("../pages/color-bird-lab/ColorBirdLabPage").then((module) => ({ default: module.ColorBirdLabPage })));
const ColorGuineaPigLabPage = lazy(() => import("../pages/color-guinea-pig-lab/ColorGuineaPigLabPage").then((module) => ({ default: module.ColorGuineaPigLabPage })));
const ColorBearSingerLabPage = lazy(() => import("../pages/color-bear-singer-lab/ColorBearSingerLabPage").then((module) => ({ default: module.ColorBearSingerLabPage })));
const ColorCatLabPage = lazy(() => import("../pages/color-cat-lab/ColorCatLabPage").then((module) => ({ default: module.ColorCatLabPage })));
const ColorBlackCatLabPage = lazy(() => import("../pages/color-black-cat-lab/ColorBlackCatLabPage").then((module) => ({ default: module.ColorBlackCatLabPage })));
const ColorCoolWolfLabPage = lazy(() => import("../pages/color-cool-wolf-lab/ColorCoolWolfLabPage").then((module) => ({ default: module.ColorCoolWolfLabPage })));
const ColorDogCameraLabPage = lazy(() => import("../pages/color-dog-camera-lab/ColorDogCameraLabPage").then((module) => ({ default: module.ColorDogCameraLabPage })));
const ColorDogDrumLabPage = lazy(() => import("../pages/color-dog-drum-lab/ColorDogDrumLabPage").then((module) => ({ default: module.ColorDogDrumLabPage })));
const ColorKoalaLabPage = lazy(() => import("../pages/color-koala-lab/ColorKoalaLabPage").then((module) => ({ default: module.ColorKoalaLabPage })));
const ColorKarpyLabPage = lazy(() => import("../pages/color-karpy-lab/ColorKarpyLabPage").then((module) => ({ default: module.ColorKarpyLabPage })));
const ColorHamsterIcecreamLabPage = lazy(() => import("../pages/color-hamster-icecream-lab/ColorHamsterIcecreamLabPage").then((module) => ({ default: module.ColorHamsterIcecreamLabPage })));
const ColorDinoLabPage = lazy(() => import("../pages/color-dino-lab/ColorDinoLabPage").then((module) => ({ default: module.ColorDinoLabPage })));
const ColorDeerLabPage = lazy(() => import("../pages/color-deer-lab/ColorDeerLabPage").then((module) => ({ default: module.ColorDeerLabPage })));
const ColorPenguinLabPage = lazy(() => import("../pages/color-penguin-lab/ColorPenguinLabPage").then((module) => ({ default: module.ColorPenguinLabPage })));
const ColorSheepLabPage = lazy(() => import("../pages/color-sheep-lab/ColorSheepLabPage").then((module) => ({ default: module.ColorSheepLabPage })));
const ColorSlothLabPage = lazy(() => import("../pages/color-sloth-lab/ColorSlothLabPage").then((module) => ({ default: module.ColorSlothLabPage })));
const ColorFoxLabPage = lazy(() => import("../pages/color-fox-lab/ColorFoxLabPage").then((module) => ({ default: module.ColorFoxLabPage })));
const ColorRacoonLabPage = lazy(() => import("../pages/color-racoon-lab/ColorRacoonLabPage").then((module) => ({ default: module.ColorRacoonLabPage })));
const ColorSealLabPage = lazy(() => import("../pages/color-seal-lab/ColorSealLabPage").then((module) => ({ default: module.ColorSealLabPage })));


const NotFoundPage = lazy(() => import("../pages/not-found/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

function RouteLoading() {
  return <div className="route-loading" role="status">正在加载页面…</div>;
}

export function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="login" element={<Navigate to="/onboarding" replace />} />
        <Route path="register" element={<Navigate to="/onboarding" replace />} />
        <Route path="auth/login" element={<Navigate to="/onboarding" replace />} />
        <Route path="auth/register" element={<Navigate to="/onboarding" replace />} />
        <Route path="agent" element={<AgentConsolePage />} />
        <Route path="agent-console" element={<Navigate to="/agent" replace />} />

        <Route path="color-bunny-lab" element={<ColorBunnyLabPage />} />
        <Route path="color-panda-lab" element={<ColorPandaLabPage />} />
        <Route path="color-otter-lab" element={<ColorOtterLabPage />} />
        <Route path="color-owl-lab" element={<ColorOwlLabPage />} />
        <Route path="color-duck-lab" element={<ColorDuckLabPage />} />
        <Route path="color-bird-lab" element={<ColorBirdLabPage />} />
        <Route path="color-guinea-pig-lab" element={<ColorGuineaPigLabPage />} />
        <Route path="color-bear-singer-lab" element={<ColorBearSingerLabPage />} />
        <Route path="color-cat-lab" element={<ColorCatLabPage />} />
        <Route path="color-black-cat-lab" element={<ColorBlackCatLabPage />} />
        <Route path="color-cool-wolf-lab" element={<ColorCoolWolfLabPage />} />
        <Route path="color-dog-camera-lab" element={<ColorDogCameraLabPage />} />
        <Route path="color-dog-drum-lab" element={<ColorDogDrumLabPage />} />
        <Route path="color-koala-lab" element={<ColorKoalaLabPage />} />
        <Route path="color-karpy-lab" element={<ColorKarpyLabPage />} />
        <Route path="color-hamster-icecream-lab" element={<ColorHamsterIcecreamLabPage />} />
        <Route path="color-dino-lab" element={<ColorDinoLabPage />} />
        <Route path="color-deer-lab" element={<ColorDeerLabPage />} />
        <Route path="color-penguin-lab" element={<ColorPenguinLabPage />} />
        <Route path="color-sheep-lab" element={<ColorSheepLabPage />} />
        <Route path="color-sloth-lab" element={<ColorSlothLabPage />} />
        <Route path="color-fox-lab" element={<ColorFoxLabPage />} />
        <Route path="color-racoon-lab" element={<ColorRacoonLabPage />} />
        <Route path="color-seal-lab" element={<ColorSealLabPage />} />


        <Route element={<RequireProfile />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="draw" element={<DrawPage />} />
            <Route path="collection" element={<CollectionPage />} />
            <Route path="echo" element={<EchoPage />} />
            <Route path="friends" element={<Navigate to="/echo" replace />} />
            <Route path="explore" element={<Navigate to="/" replace />} />
            <Route path="profile" element={<Navigate to="/collection" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
