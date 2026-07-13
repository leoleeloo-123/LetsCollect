import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { DesktopNav } from "./DesktopNav";
import { MobileHeader } from "./MobileHeader";

export function AppLayout() {
  return (
    <div className="app-shell">
      <DesktopNav />
      <MobileHeader />
      <main className="app-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
