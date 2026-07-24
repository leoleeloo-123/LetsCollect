import { UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { routes } from "../../app/routes";
import { TicketBalance } from "../../features/tickets/TicketBalance";

const TOP_RIBBON_HIDE_SCROLL_Y = 24;
const MOBILE_HEADER_MAX_WIDTH = 760;

function shouldHideMobileHeader() {
  return window.innerWidth < MOBILE_HEADER_MAX_WIDTH
    && Math.max(window.scrollY, 0) > TOP_RIBBON_HIDE_SCROLL_Y;
}

export function MobileHeader() {
  const { pathname } = useLocation();
  const [isHidden, setIsHidden] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setIsHidden(shouldHideMobileHeader());
  }, [pathname]);

  useEffect(() => {
    const updateVisibility = () => {
      animationFrameRef.current = null;
      setIsHidden(shouldHideMobileHeader());
    };

    const scheduleUpdate = () => {
      if (animationFrameRef.current !== null) return;
      animationFrameRef.current = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <header
      className={`mobile-header${isHidden ? " mobile-header--hidden" : ""}`}
      aria-hidden={isHidden}
    >
      <Link
        to={routes.home}
        className="brand-mark mobile-header__pill mobile-header__brand-pill"
        aria-label="Let's Collect 首页"
      >
        <span className="brand-mark__gem">L</span>
        <span>Let's Collect</span>
      </Link>
      <div className="mobile-header__pill mobile-header__account-pill">
        <TicketBalance compact />
        <Link
          className="mobile-header__profile-button"
          to={routes.collection}
          aria-label="打开收藏身份"
        >
          <UserRound size={19} strokeWidth={2.2} />
        </Link>
      </div>
    </header>
  );
}
