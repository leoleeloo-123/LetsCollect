import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type PointerEvent
} from "react";
import type { ToyRotationController } from "../../three/ToyViewer";

type DragSession = {
  pointerId: number;
  startX: number;
  startY: number;
  previousX: number;
  dragging: boolean;
};

const INTRO_ROTATION_RADIANS = 0.24;
const INTRO_ROTATION_DURATION_MS = 1650;

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

export function useSharedToyRotation() {
  const rotationRef = useRef(0);
  const listenersRef = useRef(new Set<() => void>());
  const dragSessionRef = useRef<DragSession | null>(null);
  const animationFrameRef = useRef(0);
  const resetTimerRef = useRef(0);

  const setRotation = useCallback((value: number) => {
    rotationRef.current = value;
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const stopMotion = useCallback(() => {
    window.cancelAnimationFrame(animationFrameRef.current);
    window.clearTimeout(resetTimerRef.current);
  }, []);

  const animateTo = useCallback((target: number, duration: number) => {
    window.cancelAnimationFrame(animationFrameRef.current);
    const from = rotationRef.current;
    const startedAt = performance.now();

    const tick = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / duration);
      setRotation(from + (target - from) * easeInOutCubic(progress));
      if (progress < 1) animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);
  }, [setRotation, stopMotion]);

  const scheduleReturnToFront = useCallback(() => {
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => animateTo(0, 680), 1200);
  }, [animateTo]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const startedAt = performance.now();
    const duration = INTRO_ROTATION_DURATION_MS;

    const tick = (time: number) => {
      const progress = Math.min(1, (time - startedAt) / duration);
      setRotation(Math.sin(progress * Math.PI) * INTRO_ROTATION_RADIANS);
      if (progress < 1) animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);
    return stopMotion;
  }, [setRotation, stopMotion]);

  const controller = useMemo<ToyRotationController>(() => ({
    getRotation: () => rotationRef.current,
    subscribe(listener) {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    }
  }), []);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;
    dragSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      previousX: event.clientX,
      dragging: false
    };
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;

    if (!session.dragging) {
      const distanceX = event.clientX - session.startX;
      const distanceY = event.clientY - session.startY;
      if (Math.abs(distanceY) > 10 && Math.abs(distanceY) > Math.abs(distanceX)) {
        dragSessionRef.current = null;
        return;
      }
      if (Math.abs(distanceX) < 8 || Math.abs(distanceX) <= Math.abs(distanceY) * 1.15) return;
      stopMotion();
      session.dragging = true;
      session.previousX = event.clientX;
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    const deltaX = event.clientX - session.previousX;
    session.previousX = event.clientX;
    setRotation(rotationRef.current + deltaX * 0.01);
  }, [setRotation, stopMotion]);

  const finishPointer = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) return;
    dragSessionRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (session.dragging) scheduleReturnToFront();
  }, [scheduleReturnToFront]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home") return;
    event.preventDefault();
    stopMotion();
    if (event.key === "Home") setRotation(0);
    else setRotation(rotationRef.current + (event.key === "ArrowLeft" ? -0.18 : 0.18));
    scheduleReturnToFront();
  }, [scheduleReturnToFront, setRotation, stopMotion]);

  return {
    controller,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp: finishPointer,
    handlePointerCancel: finishPointer,
    handleKeyDown
  };
}