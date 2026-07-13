import { NavLink } from "react-router-dom";
import { routes } from "../../app/routes";
import { ButtonLink } from "../ui/ButtonLink";

const navItems = [
  { to: routes.explore, label: "Explore" },
  { to: routes.draw, label: "Draw" },
  { to: routes.collection, label: "Collection" },
  { to: routes.profile, label: "Profile" }
];

export function DesktopNav() {
  return (
    <header className="desktop-nav">
      <NavLink to={routes.home} className="brand-mark">
        <span className="brand-mark__gem" />
        <span>Let's Collect</span>
      </NavLink>
      <nav className="desktop-nav__links" aria-label="Primary desktop navigation">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <ButtonLink to={routes.login} variant="secondary">
        Sign in
      </ButtonLink>
    </header>
  );
}
