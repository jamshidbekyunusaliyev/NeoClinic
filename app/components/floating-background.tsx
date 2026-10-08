"use client";

import { useEffect, useRef } from "react";

type Shape = "orb" | "star" | "ring" | "plus" | "heart" | "pill" | "blob";
type FloatObject = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  spin: number;
  opacity: number;
  blur: number;
  shape: Shape;
  color: string;
};

const palette = ["#8b5cf6", "#22d3ee", "#a78bfa", "#67e8f9", "#ffffff"];
const shapeNames: Shape[] = ["orb", "star", "ring", "plus", "heart", "pill", "blob"];

export function FloatingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let frame = 0;
    let width = 0;
    let height = 0;
    let objects: FloatObject[] = [];

    const makeObjects = () => {
      const count = window.innerWidth < 700 ? 18 : 40;
      objects = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 4 + Math.random() * 28,
        speedX: (Math.random() - 0.5) * 0.18,
        speedY: (Math.random() - 0.5) * 0.16,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.0018,
        opacity: 0.08 + Math.random() * 0.25,
        blur: Math.random() * 7,
        shape: shapeNames[Math.floor(Math.random() * shapeNames.length)],
        color: palette[Math.floor(Math.random() * palette.length)],
      }));
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      makeObjects();
    };

    const drawShape = (item: FloatObject) => {
      context.save();
      context.translate(item.x + pointer.x * 12, item.y + pointer.y * 12);
      context.rotate(item.rotation);
      context.globalAlpha = item.opacity;
      context.strokeStyle = item.color;
      context.fillStyle = item.color;
      context.lineWidth = Math.max(1, item.size * 0.07);
      context.shadowColor = item.color;
      context.shadowBlur = item.blur;

      if (item.shape === "orb" || item.shape === "blob") {
        context.globalAlpha = item.opacity * 0.35;
        context.beginPath();
        context.arc(0, 0, item.size, 0, Math.PI * 2);
        context.fill();
      } else if (item.shape === "ring") {
        context.beginPath();
        context.arc(0, 0, item.size * 0.6, 0, Math.PI * 2);
        context.stroke();
      } else if (item.shape === "plus") {
        context.beginPath();
        context.moveTo(-item.size * 0.6, 0);
        context.lineTo(item.size * 0.6, 0);
        context.moveTo(0, -item.size * 0.6);
        context.lineTo(0, item.size * 0.6);
        context.stroke();
      } else if (item.shape === "star") {
        context.beginPath();
        context.moveTo(0, -item.size * 0.6);
        context.lineTo(0, item.size * 0.6);
        context.moveTo(-item.size * 0.6, 0);
        context.lineTo(item.size * 0.6, 0);
        context.stroke();
      } else if (item.shape === "pill") {
        context.beginPath();
        context.roundRect(-item.size * 0.7, -item.size * 0.25, item.size * 1.4, item.size * 0.5, item.size);
        context.stroke();
        context.beginPath();
        context.moveTo(0, -item.size * 0.25);
        context.lineTo(0, item.size * 0.25);
        context.stroke();
      } else {
        context.beginPath();
        const s = item.size * 0.04;
        context.moveTo(0, 8 * s);
        context.bezierCurveTo(-12 * s, 0, -7 * s, -8 * s, 0, -3 * s);
        context.bezierCurveTo(7 * s, -8 * s, 12 * s, 0, 0, 8 * s);
        context.stroke();
      }
      context.restore();
    };

    const animate = () => {
      context.fillStyle = "#000000";
      context.fillRect(0, 0, width, height);
      pointer.x += (pointer.targetX - pointer.x) * 0.025;
      pointer.y += (pointer.targetY - pointer.y) * 0.025;
      objects.forEach((item) => {
        drawShape(item);
        if (!reducedMotion.matches) {
          item.x += item.speedX;
          item.y += item.speedY;
          item.rotation += item.spin;
        }
        if (item.x < -40) item.x = width + 40;
        if (item.x > width + 40) item.x = -40;
        if (item.y < -40) item.y = height + 40;
        if (item.y > height + 40) item.y = -40;
      });
      if (!reducedMotion.matches) frame = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.targetX = event.clientX / width - 0.5;
      pointer.targetY = event.clientY / height - 0.5;
    };
    resize();
    animate();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas aria-hidden="true" className="floating-canvas" ref={canvasRef} />;
}