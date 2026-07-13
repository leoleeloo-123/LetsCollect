import { UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { TicketBalance } from "../../features/tickets/TicketBalance";

export function MobileHeader() {
  return (
    <header className="mobile-header">
      <Link to={routes.home} className="brand-mark" aria-label="Let's Collect 首页">
        <span className="brand-mark__gem">L</span>
        <span>Let's Collect</span>
      </Link>
      <div className="mobile-header__actions">
        <TicketBalance compact />
        <Link className="icon-button" to={routes.login} aria-label="打开演示账户">
          <UserRound size={19} strokeWidth={2.2} />
        </Link>
      </div>
    </header>
  );
}
