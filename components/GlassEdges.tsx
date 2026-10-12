"use client";

import { useEffect, useRef } from "react";

export default function GlassEdges({ children }: { children: React.ReactNode }) {
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
    <div ref={rootRef} style={{ position: "relative" }}>
      {/* Page content — captured as the scene by liquidglass */}
      <div data-dynamic style={{ position: "relative", zIndex: 0 }}>
        {children}
      </div>

      {/* Left glass strip — 3vw, direct child of root */}
      <div
        ref={leftRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "3vw",
          height: "100vh",
          borderRadius: 0,
          zIndex: 40,
          pointerEvents: "none",
        }}
      />

      {/* Right glass strip — 3vw, direct child of root */}
      <div
        ref={rightRef}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "3vw",
          height: "100vh",
          borderRadius: 0,
          zIndex: 40,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
