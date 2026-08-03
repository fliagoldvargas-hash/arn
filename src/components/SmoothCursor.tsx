"use client";

import { useEffect, useRef, useState } from "react";
import { useSpring } from "motion/react";

interface Position {
  x: number;
  y: number;
}

export interface SmoothCursorProps {
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

export function SmoothCursor({
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

    window.addEventListener("pointermove", throttledPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", throttledPointerMove);
      if (rafId) cancelAnimationFrame(rafId);
      if (timeout !== null) clearTimeout(timeout);
    };
  }, [cursorX, cursorY, rotation, scale, isEnabled]);

  return null;
}
