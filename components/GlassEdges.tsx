"use client";

import { useEffect, useRef } from "react";

// Generates a PNG displacement map as a data URL.
// Left edge: strong warp at x=0, fades to neutral at x=width
// Right edge: mirrored
function makeDisplacementMap(
  width: number,
  height: number,
  direction: "left" | "right"
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(
    direction === "left" ? 0 : width,
    0,
    direction === "left" ? width : 0,
    0
  );
  // Full displacement at edge (r=255, g=128 = neutral vertical)
  grad.addColorStop(0, "rgb(255,128,128)");
  // Neutral at inner edge (r=128 = no displacement)
  grad.addColorStop(1, "rgb(128,128,128)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL("image/png");
}

function EdgeFilter({
  id,
  side,
  scale,
}: {
  id: string;
  side: "left" | "right";
  scale: number;
}) {
  const imageRef = useRef<SVGFEImageElement>(null);

  useEffect(() => {
    if (!imageRef.current) return;
    const map = makeDisplacementMap(120, 2, side);
    imageRef.current.setAttribute("href", map);
  }, [side]);

  return (
    <svg
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      aria-hidden
    >
      <defs>
        <filter
          id={id}
          x="0"
          y="0"
          width="100%"
          height="100%"
          color-interpolation-filters="sRGB"
        >
          <feImage
            ref={imageRef}
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="map"
          />
          {/* Red channel — strongest displacement */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={scale * 1.4}
            xChannelSelector="R"
            yChannelSelector="G"
            result="dispRed"
          />
          <feColorMatrix
            in="dispRed"
            type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="red"
          />
          {/* Green channel — reference */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="dispGreen"
          />
          <feColorMatrix
            in="dispGreen"
            type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
            result="green"
          />
          {/* Blue channel — medium displacement */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale={scale * 1.2}
            xChannelSelector="R"
            yChannelSelector="G"
            result="dispBlue"
          />
          <feColorMatrix
            in="dispBlue"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            result="blue"
          />
          <feBlend in="red" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blue" mode="screen" result="output" />
          <feGaussianBlur in="output" stdDeviation="0.5" />
        </filter>
      </defs>
    </svg>
  );
}

export default function GlassEdges() {
  return (
    <>
      {/* SVG filter definitions */}
      <EdgeFilter id="glass-left" side="left" scale={40} />
      <EdgeFilter id="glass-right" side="right" scale={40} />

      {/* Left edge strip */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 120,
          height: "100vh",
          zIndex: 40,
          pointerEvents: "none",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          backdropFilter: "url(#glass-left) saturate(1.2)",
          WebkitBackdropFilter: "url(#glass-left) saturate(1.2)",
          maskImage:
            "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Right edge strip */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 120,
          height: "100vh",
          zIndex: 40,
          pointerEvents: "none",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          backdropFilter: "url(#glass-right) saturate(1.2)",
          WebkitBackdropFilter: "url(#glass-right) saturate(1.2)",
          maskImage:
            "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
        }}
      />
    </>
  );
}
