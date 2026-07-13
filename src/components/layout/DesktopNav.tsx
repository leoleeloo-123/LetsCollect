import { NavLink } from "react-router-dom";
import { routes } from "../../app/routes";
import { TicketBalance } from "../../features/tickets/TicketBalance";
import { preloadDrawExperience } from "../../features/draw/preloadDraw";

const navItems = [
  { to: routes.home, label: "首页" },
  { to: routes.draw, label: "抽取" },
  { to: routes.collection, label: "收藏" },
  { to: routes.friends, label: "好友" }
];

export function DesktopNav() {
  return (
    <header className="desktop-nav">
      <NavLink to={routes.home} className="brand-mark">
        <span className="brand-mark__gem">L</span>
        <span>Let's Collect</span>
      </NavLink>
      <nav className="desktop-nav__links" aria-label="Primary desktop navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onPointerEnter={item.to === routes.draw ? preloadDrawExperience : undefined}
            onFocus={item.to === routes.draw ? preloadDrawExperience : undefined}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <TicketBalance />
    </header>
  );
}
