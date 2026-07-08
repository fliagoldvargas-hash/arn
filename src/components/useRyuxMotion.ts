"use client";

import { type RefObject } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function useRyuxMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const heroTargets = gsap.utils.toArray<HTMLElement>(
        ".hero__content > *, .docs-hero > *, .roadmap-hero > *",
        root,
      );
      const revealTargets = gsap.utils.toArray<HTMLElement>(
        [
          ".section-intro",
          ".platform-card",
          ".market-note",
          ".metric-card",
          ".docs-section h2",
          ".process-row",
          ".feature-list",
          ".technical-panel",
          ".vision-panel",
          ".cta__mark",
          ".cta h2",
          ".cta p",
          ".cta .hero__buttons",
          ".doc-card",
          ".docs-panel",
          ".skill-card",
          ".stakeholder",
          ".disclaimer",
          ".roadmap-progress",
          ".roadmap-card",
          ".footer",
        ].join(","),
        root,
      );

      if (reduceMotion) {
        gsap.set([".nav", ...heroTargets, ...revealTargets], { clearProps: "all" });
        return;
      }

      gsap.defaults({ ease: "power3.out", duration: 0.72 });

      gsap.from(".nav", {
        y: -16,
        autoAlpha: 0,
        duration: 0.55,
      });

      gsap.from(heroTargets, {
        y: 24,
        autoAlpha: 0,
        duration: 0.82,
        stagger: 0.08,
        delay: 0.08,
      });

      gsap.to(".hero__ribbon", {
        yPercent: -8,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      ScrollTrigger.batch(revealTargets, {
        start: "top 86%",
        once: true,
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { y: 34, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.72,
              stagger: 0.07,
              overwrite: "auto",
              clearProps: "transform,opacity,visibility",
            },
          );
        },
      });
    },
    { scope },
  );
}
