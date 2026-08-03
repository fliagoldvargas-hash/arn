"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

gsap.registerPlugin(useGSAP);

export function SmoothCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useGSAP((_context, contextSafe) => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const media = gsap.matchMedia();
    media.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const moveDot = gsap.quickTo(dot, "x", { duration: 0.16, ease: "power3.out" });
      const moveDotY = gsap.quickTo(dot, "y", { duration: 0.16, ease: "power3.out" });
      const moveRing = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3.out" });
      const moveRingY = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3.out" });

      const onPointerMove = (event: PointerEvent) => {
        moveDot(event.clientX, event.clientY);
        moveDotY(event.clientY);
        moveRing(event.clientX, event.clientY);
        moveRingY(event.clientY);
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
      };
      const safeOnPointerMove = contextSafe ? contextSafe(onPointerMove) : onPointerMove;

      window.addEventListener("pointermove", safeOnPointerMove, { passive: true });

      return () => {
        window.removeEventListener("pointermove", safeOnPointerMove);
        gsap.killTweensOf([dot, ring]);
      };
    });

    return () => media.revert();
  });

  return (
    <div className="smooth-cursor" aria-hidden="true">
      <div ref={ringRef} className="smooth-cursor__ring" />
      <div ref={dotRef} className="smooth-cursor__dot" />
    </div>
  );
}
