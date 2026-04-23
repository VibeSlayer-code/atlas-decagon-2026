"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
interface BeamsBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
}
interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}
function createBeam(w: number, h: number): Beam {
  const diagonal = Math.sqrt(w * w + h * h);
  return {
    x: Math.random() * w * 0.5 - w * 0.1,
    y: -Math.random() * h * 0.3,
    width: 40 + Math.random() * 70,
    length: diagonal * 1.2,
    angle: 25 + Math.random() * 15, 
    speed: 0.5 + Math.random() * 0.8,
    opacity: 0.08 + Math.random() * 0.1,
    hue: 265 + Math.random() * 35,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.012 + Math.random() * 0.02,
  };
}
export function BeamsBackground({
  className,
  children,
  intensity = "subtle",
}: BeamsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const frameRef = useRef<number>(0);
  const opMul = { subtle: 0.6, medium: 0.8, strong: 1.0 };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      beamsRef.current = Array.from({ length: 12 }, () => createBeam(w, h));
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.filter = "blur(50px)";
      beamsRef.current.forEach((b) => {
        b.pulse += b.pulseSpeed;
        const rad = (b.angle * Math.PI) / 180;
        b.x += Math.sin(rad) * b.speed * 0.3;
        b.y += Math.cos(rad) * b.speed * 0.3;
        if (b.x > w * 1.2 || b.y > h * 1.2) {
          const nb = createBeam(w, h);
          Object.assign(b, nb);
        }
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(rad);
        const op = b.opacity * (0.8 + Math.sin(b.pulse) * 0.2) * opMul[intensity];
        const c = `${b.hue}, 75%, 50%`;
        const g = ctx.createLinearGradient(0, 0, 0, b.length);
        g.addColorStop(0, `hsla(${c}, ${op})`);
        g.addColorStop(0.3, `hsla(${c}, ${op * 1.2})`);
        g.addColorStop(0.7, `hsla(${c}, ${op * 0.6})`);
        g.addColorStop(1, `hsla(${c}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(-b.width / 2, 0, b.width, b.length);
        ctx.restore();
      });
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [intensity]);
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
