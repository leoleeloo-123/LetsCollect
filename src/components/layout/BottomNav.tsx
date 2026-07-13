import { NavLink } from "react-router-dom";
import { routes } from "../../app/routes";

const navItems = [
  { to: routes.home, label: "Home" },
  { to: routes.explore, label: "Explore" },
  { to: routes.draw, label: "Draw" },
  { to: routes.collection, label: "Collection" },
  { to: routes.profile, label: "Profile" }
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary mobile navigation">
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} className="bottom-nav__item">
          <span className="bottom-nav__dot" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
