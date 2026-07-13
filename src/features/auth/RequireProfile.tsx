import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireProfile() {
  const { status, error, retry } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <main className="identity-gate" role="status">
        <span className="identity-gate__mark">L</span>
        <strong>正在找回你的收藏身份</strong>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="identity-gate" role="alert">
        <span className="identity-gate__mark">L</span>
        <strong>身份服务暂时没有准备好</strong>
        <p>{error}</p>
        <button type="button" onClick={retry}>重新连接</button>
      </main>
    );
  }

  if (status === "needs-onboarding") {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
