import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { RequireProfile } from "../features/auth/RequireProfile";

const CollectionPage = lazy(() => import("../pages/collection/CollectionPage").then((module) => ({ default: module.CollectionPage })));
const DrawPage = lazy(() => import("../pages/draw/DrawPage").then((module) => ({ default: module.DrawPage })));
const HomePage = lazy(() => import("../pages/home/HomePage").then((module) => ({ default: module.HomePage })));
const OnboardingPage = lazy(() => import("../pages/auth/OnboardingPage").then((module) => ({ default: module.OnboardingPage })));
const FriendsPage = lazy(() => import("../pages/friends/FriendsPage").then((module) => ({ default: module.FriendsPage })));
const MaterialLabPage = lazy(() => import("../pages/material-lab/MaterialLabPage").then((module) => ({ default: module.MaterialLabPage })));
const ColorBunnyLabPage = lazy(() => import("../pages/color-bunny-lab/ColorBunnyLabPage").then((module) => ({ default: module.ColorBunnyLabPage })));
const ColorPandaLabPage = lazy(() => import("../pages/color-panda-lab/ColorPandaLabPage").then((module) => ({ default: module.ColorPandaLabPage })));
const ColorOtterLabPage = lazy(() => import("../pages/color-otter-lab/ColorOtterLabPage").then((module) => ({ default: module.ColorOtterLabPage })));
const ColorBirdLabPage = lazy(() => import("../pages/color-bird-lab/ColorBirdLabPage").then((module) => ({ default: module.ColorBirdLabPage })));
const ColorCatLabPage = lazy(() => import("../pages/color-cat-lab/ColorCatLabPage").then((module) => ({ default: module.ColorCatLabPage })));
const ColorTeddyLabPage = lazy(() => import("../pages/color-teddy-lab/ColorTeddyLabPage").then((module) => ({ default: module.ColorTeddyLabPage })));
const DiamondUnicornLabPage = lazy(() => import("../pages/diamond-unicorn-lab/DiamondUnicornLabPage").then((module) => ({ default: module.DiamondUnicornLabPage })));
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
        <Route path="material-lab" element={<MaterialLabPage />} />
        <Route path="color-bunny-lab" element={<ColorBunnyLabPage />} />
        <Route path="color-panda-lab" element={<ColorPandaLabPage />} />
        <Route path="color-otter-lab" element={<ColorOtterLabPage />} />
        <Route path="color-bird-lab" element={<ColorBirdLabPage />} />
        <Route path="color-cat-lab" element={<ColorCatLabPage />} />
        <Route path="color-teddy-lab" element={<ColorTeddyLabPage />} />
        <Route path="diamond-unicorn-lab" element={<DiamondUnicornLabPage />} />
        <Route element={<RequireProfile />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="draw" element={<DrawPage />} />
            <Route path="collection" element={<CollectionPage />} />
            <Route path="friends" element={<FriendsPage />} />
            <Route path="explore" element={<Navigate to="/" replace />} />
            <Route path="profile" element={<Navigate to="/friends" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}