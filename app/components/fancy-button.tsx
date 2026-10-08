"use client";

import { type ButtonHTMLAttributes, useState } from "react";
import { LoaderCircle } from "lucide-react";

type Variant = "glow" | "liquid" | "magnetic" | "ghost-neon";
type FancyButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

export function FancyButton({ variant = "glow", loading = false, disabled, className = "", children, onPointerMove, onPointerLeave, onClick, ...props }: FancyButtonProps) {
  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);

  const pointerMove: React.PointerEventHandler<HTMLButtonElement> = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setCursor({ x: ((event.clientX - bounds.left) / bounds.width) * 100, y: ((event.clientY - bounds.top) / bounds.height) * 100 });
    if (variant === "magnetic") setOffset({ x: (event.clientX - bounds.left - bounds.width / 2) * 0.1, y: (event.clientY - bounds.top - bounds.height / 2) * 0.1 });
    onPointerMove?.(event);
  };

  const pointerLeave: React.PointerEventHandler<HTMLButtonElement> = (event) => {
    setOffset({ x: 0, y: 0 });
    onPointerLeave?.(event);
  };

  const click: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setRipple({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, key: Date.now() });
    onClick?.(event);
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      onPointerMove={pointerMove}
      onPointerLeave={pointerLeave}
      onClick={click}
      style={{ "--cursor-x": `${cursor.x}%`, "--cursor-y": `${cursor.y}%`, transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`, ...props.style } as React.CSSProperties}
      className={`fancy-button fancy-${variant} ${className}`}
    >
      <span className="fancy-button-content">{loading ? <LoaderCircle className="animate-spin" size={16} aria-hidden="true" /> : children}</span>
      {ripple && <span key={ripple.key} className="button-ripple" style={{ left: ripple.x, top: ripple.y }} />}
    </button>
  );
}