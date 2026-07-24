import { Bot } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { routes } from "../../app/routes";
import { TicketBalance } from "../../features/tickets/TicketBalance";

const navItems = [
  { to: routes.home, label: "收藏" },
  { to: routes.collection, label: "藏品柜" },
  { to: routes.echo, label: "回声" }
];

export function DesktopNav() {
  return (
    <header className="desktop-nav">
      <NavLink to={routes.home} className="brand-mark">
        <span className="brand-mark__gem">L</span>
        <span>Let's Collect</span>
      </NavLink>
      <nav className="desktop-nav__links" aria-label="桌面主要导航">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="desktop-nav__tools">
        <Link className="desktop-nav__agent-link" to={routes.agent}>
          <Bot size={14} aria-hidden="true" /> <span>内部</span>
        </Link>
        <TicketBalance />
      </div>
    </header>
  );
}
