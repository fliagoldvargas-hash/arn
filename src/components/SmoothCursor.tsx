"use client";

import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { motion, useSpring } from "motion/react";

interface Position {
  x: number;
  y: number;
}

export interface SmoothCursorProps {
  cursor?: ReactNode;
  springConfig?: {
    damping: number;
    stiffness: number;
    mass: number;
    restDelta: number;
  };
}

const DESKTOP_POINTER_QUERY = "(any-hover: hover) and (any-pointer: fine)";

function isTrackablePointer(pointerType: string) {
  return pointerType !== "touch";
}

const DefaultCursorSVG: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={30} viewBox="0 0 24 30" fill="none" style={{ scale: 0.85 }}>
    <path d="M3 2.5V23.7L8.7 18.1L13.3 28L17.7 26L13.2 16.4H21.2L3 2.5Z" fill="white" stroke="black" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export function SmoothCursor({
  cursor = <DefaultCursorSVG />,
  springConfig = { damping: 45, stiffness: 400, mass: 1, restDelta: 0.001 },
}: SmoothCursorProps) {
  const lastMousePos = useRef<Position>({ x: 0, y: 0 });
  const velocity = useRef<Position>({ x: 0, y: 0 });
  const lastUpdateTime = useRef(Date.now());
  const previousAngle = useRef(0);
  const accumulatedRotation = useRef(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);
  const rotation = useSpring(0, { ...springConfig, damping: 60, stiffness: 300 });
  const scale = useSpring(1, { ...springConfig, stiffness: 500, damping: 35 });

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_POINTER_QUERY);
    const updateEnabled = () => {
      setIsEnabled(mediaQuery.matches);
      if (!mediaQuery.matches) setIsVisible(false);
    };

    updateEnabled();
    mediaQuery.addEventListener("change", updateEnabled);
    return () => mediaQuery.removeEventListener("change", updateEnabled);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const smoothPointerMove = (event: PointerEvent) => {
      if (!isTrackablePointer(event.pointerType)) return;

      setIsVisible(true);
      const currentPos = { x: event.clientX, y: event.clientY };
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime.current;

      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        };
      }

      lastUpdateTime.current = currentTime;
      lastMousePos.current = currentPos;
      cursorX.set(currentPos.x);
      cursorY.set(currentPos.y);

      const speed = Math.hypot(velocity.current.x, velocity.current.y);
      if (speed <= 0.1) return;

      const currentAngle = Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) + 90;
      let angleDiff = currentAngle - previousAngle.current;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;
      accumulatedRotation.current += angleDiff;
      rotation.set(accumulatedRotation.current);
      previousAngle.current = currentAngle;
      scale.set(0.95);

      if (timeout !== null) clearTimeout(timeout);
      timeout = setTimeout(() => scale.set(1), 150);
    };

    let rafId = 0;
    const throttledPointerMove = (event: PointerEvent) => {
      if (!isTrackablePointer(event.pointerType) || rafId) return;
      rafId = requestAnimationFrame(() => {
        smoothPointerMove(event);
        rafId = 0;
      });
    };

    document.body.style.cursor = "none";
    window.addEventListener("pointermove", throttledPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", throttledPointerMove);
      document.body.style.cursor = "auto";
      if (rafId) cancelAnimationFrame(rafId);
      if (timeout !== null) clearTimeout(timeout);
    };
  }, [cursorX, cursorY, rotation, scale, isEnabled]);

  if (!isEnabled) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        left: cursorX,
        top: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: rotation,
        scale,
        zIndex: 100,
        pointerEvents: "none",
        willChange: "transform",
        opacity: isVisible ? 1 : 0,
      }}
      initial={false}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.15 }}
      aria-hidden="true"
    >
      {cursor}
    </motion.div>
  );
}
