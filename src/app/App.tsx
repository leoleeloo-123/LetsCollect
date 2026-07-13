import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { CollectionPage } from "../pages/collection/CollectionPage";
import { DrawPage } from "../pages/draw/DrawPage";
import { HomePage } from "../pages/home/HomePage";
import { OnboardingPage } from "../pages/auth/OnboardingPage";
import { FriendsPage } from "../pages/friends/FriendsPage";
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
