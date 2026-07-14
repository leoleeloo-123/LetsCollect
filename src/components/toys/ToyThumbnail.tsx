import { useEffect, useRef, useState } from "react";
import type { Collectible } from "../../types/toy";
import {
  getCachedToyThumbnail,
  getOrCreateToyThumbnail
} from "../../three/ThumbnailRenderer";

type ToyThumbnailProps = {
  toy: Collectible;
  size?: "small" | "card" | "large";
  cacheOnly?: boolean;
  className?: string;
};

type ThumbnailStatus = "waiting" | "loading" | "ready" | "error";

export function ToyThumbnail({
  toy,
  size = "card",
  cacheOnly = false,
  className = ""
}: ToyThumbnailProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(cacheOnly);
  const [source, setSource] = useState<string | null>(null);
  const [status, setStatus] = useState<ThumbnailStatus>("waiting");

  useEffect(() => {
    const host = hostRef.current;
    if (!host || cacheOnly || visible) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "180px" }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [cacheOnly, visible]);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    let objectUrl: string | null = null;
    setStatus("loading");
    setSource(null);

    const load = cacheOnly ? getCachedToyThumbnail(toy) : getOrCreateToyThumbnail(toy);
    load
      .then((blob) => {
        if (!active) return;
        if (!blob) {
          setStatus("waiting");
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setSource(objectUrl);
        setStatus("ready");
      })
      .catch((error) => {
        console.error("[ToyThumbnail] 缩略图生成失败", error);
        if (active) setStatus("error");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [cacheOnly, toy, visible]);

  return (
    <div
      ref={hostRef}
      className={`toy-thumbnail toy-thumbnail--${size}${className ? ` ${className}` : ""}`}
      data-status={status}
      role="img"
      aria-label={toy.name}
    >
      {source ? <img src={source} alt="" draggable={false} /> : null}
      {status !== "ready" ? (
        <span className="toy-thumbnail__placeholder" aria-hidden="true">
          <span />
        </span>
      ) : null}
    </div>
  );
}
