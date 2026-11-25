"use client";

import { useEffect, useRef, useState } from "react";

const GRID_SPACING = 28;
const DOT_RADIUS = 1;
const REPEL_RADIUS = 120;
const MAX_DISPLACEMENT = 14;
const SPRING_STIFFNESS = 160;
const SPRING_DAMPING = 18;
const SETTLE_EPSILON = 0.05;

const LIGHT_DOT_COLOR = "rgba(203, 213, 225, 0.45)"; // #cbd5e1 at ~0.45 opacity
const DARK_DOT_COLOR = "#1e293b";

export function HeroDotGrid() {
  const [interactive, setInteractive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setInteractive(hoverQuery.matches && !motionQuery.matches);
    };

    update();
    hoverQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);

    return () => {
      hoverQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!interactive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let count = 0;
    let hx = new Float32Array(0);
    let hy = new Float32Array(0);
    let dx = new Float32Array(0);
    let dy = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);

    let mouseX = -9999;
    let mouseY = -9999;
    let pointerActive = false;

    let isInView = true;
    let isDark = document.documentElement.classList.contains("dark");
    let rafId = 0;
    let lastTime = 0;

    const buildGrid = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));

      const cols = Math.ceil(width / GRID_SPACING);
      const rows = Math.ceil(height / GRID_SPACING);
      count = cols * rows;

      hx = new Float32Array(count);
      hy = new Float32Array(count);
      dx = new Float32Array(count);
      dy = new Float32Array(count);
      vx = new Float32Array(count);
      vy = new Float32Array(count);

      const offset = GRID_SPACING / 2;
      let idx = 0;
      for (let r = 0; r < rows; r++) {
        const y = r * GRID_SPACING + offset;
        for (let c = 0; c < cols; c++) {
          hx[idx] = c * GRID_SPACING + offset;
          hy[idx] = y;
          idx++;
        }
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = isDark ? DARK_DOT_COLOR : LIGHT_DOT_COLOR;
      ctx.beginPath();

      for (let i = 0; i < count; i++) {
        const x = hx[i] + dx[i];
        const y = hy[i] + dy[i];
        ctx.moveTo(x + DOT_RADIUS, y);
        ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
      }

      ctx.fill();
    };

    const step = (now: number) => {
      rafId = 0;
      if (!isInView) return;

      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.033) : 0.016;
      lastTime = now;

      let anyMoving = false;
      const radiusSq = REPEL_RADIUS * REPEL_RADIUS;

      for (let i = 0; i < count; i++) {
        let tx = 0;
        let ty = 0;

        if (pointerActive) {
          const rx = hx[i] - mouseX;
          const ry = hy[i] - mouseY;
          const distSq = rx * rx + ry * ry;

          if (distSq < radiusSq && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const falloff = 1 - dist / REPEL_RADIUS;
            const strength = falloff * falloff * MAX_DISPLACEMENT;
            tx = (rx / dist) * strength;
            ty = (ry / dist) * strength;
          }
        }

        const errX = tx - dx[i];
        const errY = ty - dy[i];

        if (
          Math.abs(errX) < SETTLE_EPSILON &&
          Math.abs(errY) < SETTLE_EPSILON &&
          Math.abs(vx[i]) < SETTLE_EPSILON &&
          Math.abs(vy[i]) < SETTLE_EPSILON
        ) {
          dx[i] = tx;
          dy[i] = ty;
          vx[i] = 0;
          vy[i] = 0;
        } else {
          const ax = errX * SPRING_STIFFNESS - vx[i] * SPRING_DAMPING;
          const ay = errY * SPRING_STIFFNESS - vy[i] * SPRING_DAMPING;
          vx[i] += ax * dt;
          vy[i] += ay * dt;
          dx[i] += vx[i] * dt;
          dy[i] += vy[i] * dt;
          anyMoving = true;
        }
      }

      draw();

      if (anyMoving && isInView) {
        rafId = requestAnimationFrame(step);
      } else {
        lastTime = 0;
      }
    };

    const startLoop = () => {
      if (!isInView || rafId) return;
      lastTime = 0;
      rafId = requestAnimationFrame(step);
    };

    const stopLoop = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      lastTime = 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isInView) return;
      const rect = canvas.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      const withinInfluence =
        localX >= -REPEL_RADIUS &&
        localX <= width + REPEL_RADIUS &&
        localY >= -REPEL_RADIUS &&
        localY <= height + REPEL_RADIUS;

      if (withinInfluence) {
        mouseX = localX;
        mouseY = localY;
        pointerActive = true;
        startLoop();
      } else if (pointerActive) {
        pointerActive = false;
        startLoop();
      }
    };

    const handleMouseLeave = () => {
      if (pointerActive) {
        pointerActive = false;
        startLoop();
      }
    };

    buildGrid();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      buildGrid();
      draw();
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isInView = entry.isIntersecting;
        if (isInView) {
          draw();
        } else {
          stopLoop();
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    const mutationObserver = new MutationObserver(() => {
      const nextDark = document.documentElement.classList.contains("dark");
      if (nextDark !== isDark) {
        isDark = nextDark;
        draw();
      }
    });
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("blur", handleMouseLeave);

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("blur", handleMouseLeave);
    };
  }, [interactive]);

  if (!interactive) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-45 dark:opacity-100"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
