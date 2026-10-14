"use client";

import { useRef, useEffect, useCallback } from "react";
import Image from "next/image";

type GalleryImage = {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
};

const MOVE_DURATION_MS = 450;
const STEP_PAUSE_MS = 500;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// The scrollLeft that puts the child at `index` flush against the track's own left padding,
// so every stopped image's left edge lines up with the logo/text container's left edge.
const getChildOffset = (el: HTMLDivElement, index: number) => {
  const child = el.children[index] as HTMLElement | undefined;
  if (!child) return 0;
  const paddingLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
  return child.offsetLeft - paddingLeft;
};

// After a manual drag, finds the next image to step toward from the current scroll position.
const findNextIndex = (el: HTMLDivElement, imagesLength: number) => {
  const paddingLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
  for (let i = 1; i <= imagesLength; i++) {
    const child = el.children[i] as HTMLElement | undefined;
    if (child && child.offsetLeft - paddingLeft > el.scrollLeft + 1) {
      return i;
    }
  }
  return 1;
};

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const animRef = useRef<number>(undefined);

  // Step-and-pause autoplay: ease toward one image over MOVE_DURATION_MS, then hold for STEP_PAUSE_MS.
  const phaseRef = useRef<"moving" | "paused">("paused");
  const targetIndexRef = useRef(1);
  const moveStartScrollRef = useRef(0);
  const moveTargetRef = useRef(0);
  const moveStartTimeRef = useRef(0);
  const pauseUntilRef = useRef(0);

  const tick = useCallback(() => {
    const el = scrollRef.current;
    if (el && !isPaused.current) {
      const now = performance.now();
      if (phaseRef.current === "paused") {
        if (now >= pauseUntilRef.current) {
          moveStartScrollRef.current = el.scrollLeft;
          moveTargetRef.current = getChildOffset(el, targetIndexRef.current);
          moveStartTimeRef.current = now;
          phaseRef.current = "moving";
        }
      } else {
        const t = Math.min((now - moveStartTimeRef.current) / MOVE_DURATION_MS, 1);
        const eased = easeOutCubic(t);
        el.scrollLeft =
          moveStartScrollRef.current + (moveTargetRef.current - moveStartScrollRef.current) * eased;
        if (t >= 1) {
          el.scrollLeft = moveTargetRef.current;
          let nextIndex = targetIndexRef.current + 1;
          if (nextIndex > images.length) {
            el.scrollLeft = 0;
            nextIndex = 1;
          }
          targetIndexRef.current = nextIndex;
          phaseRef.current = "paused";
          pauseUntilRef.current = now + STEP_PAUSE_MS;
        }
      }
    }
    animRef.current = requestAnimationFrame(tick);
  }, [images.length]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [tick]);

  // Drag handlers
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    isPaused.current = true;
    startX.current = e.clientX;
    startScrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = startScrollLeft.current - dx;
    }
  };

  const onPointerUp = () => {
    isDragging.current = false;
    isPaused.current = false;
    const el = scrollRef.current;
    if (el) {
      targetIndexRef.current = findNextIndex(el, images.length);
      phaseRef.current = "paused";
      pauseUntilRef.current = performance.now() + STEP_PAUSE_MS;
    }
  };

  // Duplicate images for seamless loop
  const loopedImages = [...images, ...images];

  return (
    <section className="py-[10px] bg-[#131415]">
      <div
        ref={scrollRef}
        className="flex gap-[10px] overflow-x-auto scrollbar-hide px-[25px] md:px-[50px] cursor-grab active:cursor-grabbing select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {loopedImages.map((img, i) => (
          <div key={i} className="flex-shrink-0">
            <Image
              src={img.src}
              alt={i < images.length ? `Project ${i + 1}` : ""}
              width={img.naturalWidth}
              height={img.naturalHeight}
              className="h-[373px] md:h-[533px] w-auto block rounded-[12px]"
              unoptimized={img.src.endsWith(".gif")}
              draggable={false}
              aria-hidden={i >= images.length}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
