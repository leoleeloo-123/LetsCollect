import { House, LibraryBig, Sparkles, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { routes } from "../../app/routes";
import { preloadDrawExperience } from "../../features/draw/preloadDraw";

const navItems = [
  { to: routes.home, label: "首页", icon: House },
  { to: routes.draw, label: "抽取", icon: Sparkles },
  { to: routes.collection, label: "收藏", icon: LibraryBig },
  { to: routes.friends, label: "好友", icon: UsersRound }
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="主要导航">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className="bottom-nav__item"
          onPointerEnter={to === routes.draw ? preloadDrawExperience : undefined}
          onPointerDown={to === routes.draw ? preloadDrawExperience : undefined}
          onFocus={to === routes.draw ? preloadDrawExperience : undefined}
        >
          <Icon size={21} strokeWidth={2.1} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
