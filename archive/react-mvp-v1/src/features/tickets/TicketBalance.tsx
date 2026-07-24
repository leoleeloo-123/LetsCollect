import { Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routes";
import { useMvpState } from "../../app/MvpState";

type TicketBalanceProps = {
  compact?: boolean;
};

export function TicketBalance({ compact = false }: TicketBalanceProps) {
  const { tickets } = useMvpState();

  return (
    <Link
      to={routes.draw}
      className={`ticket-balance${compact ? " ticket-balance--compact" : ""}`}
      aria-label={`当前有 ${tickets} 张抽取券`}
    >
      <Ticket size={17} strokeWidth={2.2} />
      <strong>{tickets}</strong>
      {compact ? null : <span>抽取券</span>}
    </Link>
  );
}
