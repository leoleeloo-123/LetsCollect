import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { CollectionPage } from "../pages/collection/CollectionPage";
import { DrawPage } from "../pages/draw/DrawPage";
import { ExplorePage } from "../pages/explore/ExplorePage";
import { HomePage } from "../pages/home/HomePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { NotFoundPage } from "../pages/not-found/NotFoundPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="draw" element={<DrawPage />} />
        <Route path="collection" element={<CollectionPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="auth/login" element={<Navigate to="/login" replace />} />
        <Route path="auth/register" element={<Navigate to="/register" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
