"use client";

import { useEffect, useRef } from "react";

export default function GlassEdges() {
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { LiquidGlass } = await import("@ybouane/liquidglass");
      if (cancelled || !rootRef.current || !leftRef.current || !rightRef.current) return;

      const config = JSON.stringify({
        blurAmount: 0.15,
        refraction: 0.6,
        chromAberration: 0.08,
        edgeHighlight: 0.03,
        fresnel: 0.8,
        specular: 0.0,
        distortion: 0.0,
        floating: false,
      });

      leftRef.current.dataset.config = config;
      rightRef.current.dataset.config = config;

      instanceRef.current = await LiquidGlass.init({
        root: rootRef.current,
        glassElements: [leftRef.current, rightRef.current],
      });
    }

    init();
    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Background capture layer — liquidglass needs a sibling with the bg */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "none",
        }}
      />

      {/* Left edge — 3vw */}
      <div
        ref={leftRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "3vw",
          height: "100%",
          borderRadius: 0,
        }}
      />

      {/* Right edge — 3vw */}
      <div
        ref={rightRef}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "3vw",
          height: "100%",
          borderRadius: 0,
        }}
      />
    </div>
  );
}
