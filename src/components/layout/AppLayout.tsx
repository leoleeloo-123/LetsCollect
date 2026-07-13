import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopNav } from "./DesktopNav";

export function AppLayout() {
  return (
    <div className="app-shell">
      <DesktopNav />
      <main className="app-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
