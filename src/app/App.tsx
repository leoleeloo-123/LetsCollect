import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { CollectionPage } from "../pages/collection/CollectionPage";
import { DrawPage } from "../pages/draw/DrawPage";
import { HomePage } from "../pages/home/HomePage";
import { OnboardingPage } from "../pages/auth/OnboardingPage";
import { FriendsPage } from "../pages/friends/FriendsPage";
import { MaterialLabPage } from "../pages/material-lab/MaterialLabPage";
import { ColorBunnyLabPage } from "../pages/color-bunny-lab/ColorBunnyLabPage";
import { ColorBirdLabPage } from "../pages/color-bird-lab/ColorBirdLabPage";
import { ColorCatLabPage } from "../pages/color-cat-lab/ColorCatLabPage";
import { ColorDogLabPage } from "../pages/color-dog-lab/ColorDogLabPage";
import { ColorTeddyLabPage } from "../pages/color-teddy-lab/ColorTeddyLabPage";
import { ColorUnicornLabPage } from "../pages/color-unicorn-lab/ColorUnicornLabPage";
import { NotFoundPage } from "../pages/not-found/NotFoundPage";
import { RequireProfile } from "../features/auth/RequireProfile";

export function App() {
  return (
    <Routes>
      <Route path="onboarding" element={<OnboardingPage />} />
      <Route path="login" element={<Navigate to="/onboarding" replace />} />
      <Route path="register" element={<Navigate to="/onboarding" replace />} />
      <Route path="auth/login" element={<Navigate to="/onboarding" replace />} />
      <Route path="auth/register" element={<Navigate to="/onboarding" replace />} />
      <Route path="material-lab" element={<MaterialLabPage />} />
      <Route path="color-bunny-lab" element={<ColorBunnyLabPage />} />
      <Route path="color-bird-lab" element={<ColorBirdLabPage />} />
      <Route path="color-cat-lab" element={<ColorCatLabPage />} />
      <Route path="color-dog-lab" element={<ColorDogLabPage />} />
      <Route path="color-teddy-lab" element={<ColorTeddyLabPage />} />
      <Route path="color-unicorn-lab" element={<ColorUnicornLabPage />} />
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
  );
}
