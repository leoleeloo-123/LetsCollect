import { Bot } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { routes } from "../../app/routes";
import { TicketBalance } from "../../features/tickets/TicketBalance";

const navItems = [
  { to: routes.home, label: "Collect" },
  { to: routes.collection, label: "Collection" },
  { to: routes.echo, label: "Echo" }
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
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="desktop-nav__tools">
        <Link className="desktop-nav__agent-link" to={routes.agent}>
          <Bot size={14} aria-hidden="true" /> <span>Internal</span>
        </Link>
        <TicketBalance />
      </div>
    </header>
  );
}
