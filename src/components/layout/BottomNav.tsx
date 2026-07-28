import { LibraryBig, Sparkles, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { routes } from "../../app/routes";

const navItems = [
  { to: routes.home, label: "收藏", icon: Sparkles },
  { to: routes.collection, label: "藏品柜", icon: LibraryBig },
  { to: routes.echo, label: "回声", icon: Waves }
];

const COLLAPSE_SCROLL_Y = 36;
const MOBILE_NAV_MAX_WIDTH = 760;

export function BottomNav() {
  const { pathname } = useLocation();
  const [isCompact, setIsCompact] = useState(false);
  const lastScrollYRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setIsCompact(false);
    lastScrollYRef.current = Math.max(window.scrollY, 0);
  }, [pathname]);

  useEffect(() => {
    const updateNavState = () => {
      animationFrameRef.current = null;
      const nextScrollY = Math.max(window.scrollY, 0);

      if (window.innerWidth >= MOBILE_NAV_MAX_WIDTH || nextScrollY <= COLLAPSE_SCROLL_Y) {
        setIsCompact(false);
      } else if (nextScrollY > lastScrollYRef.current) {
        setIsCompact(true);
      } else if (nextScrollY < lastScrollYRef.current) {
        setIsCompact(false);
      }

      lastScrollYRef.current = nextScrollY;
    };

    const handleScroll = () => {
      if (animationFrameRef.current !== null) return;
      animationFrameRef.current = window.requestAnimationFrame(updateNavState);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("bottom-nav-is-compact", isCompact);
    return () => root.classList.remove("bottom-nav-is-compact");
  }, [isCompact]);

  return (
    <nav className="bottom-nav" aria-label="主要导航">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className="bottom-nav__item"
        >
          <Icon size={21} strokeWidth={2.1} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
