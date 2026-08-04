"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import "./ElectricBorder.css";

type Props = { children: ReactNode; color?: string; speed?: number; chaos?: number; borderRadius?: number; className?: string; style?: CSSProperties };

export default function ElectricBorder({ children, color = "#06B6D4", speed = 0.7, chaos = 0.01, borderRadius = 2, className = "", style }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const random = useCallback((value: number) => (Math.sin(value * 12.9898) * 43758.5453) % 1, []);
  const noise2D = useCallback((x: number, y: number) => {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    const a = random(i + j * 57), b = random(i + 1 + j * 57), c = random(i + (j + 1) * 57), d = random(i + 1 + (j + 1) * 57);
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
  }, [random]);
  const octave = useCallback((x: number, time: number, seed: number) => {
    let result = 0, amplitude = chaos, frequency = 10;
    for (let index = 0; index < 10; index += 1) {
      result += amplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3);
      frequency *= 1.6;
      amplitude *= 0.7;
    }
    return result;
  }, [chaos, noise2D]);
  const roundedPoint = useCallback((t: number, left: number, top: number, width: number, height: number, radius: number) => {
    const straightWidth = width - 2 * radius, straightHeight = height - 2 * radius;
    const cornerArc = Math.PI * radius / 2, perimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
    let distance = t * perimeter;
    const corner = (x: number, y: number, start: number, progress: number) => ({ x: x + radius * Math.cos(start + progress * Math.PI / 2), y: y + radius * Math.sin(start + progress * Math.PI / 2) });
    if (distance <= straightWidth) return { x: left + radius + distance, y: top };
    distance -= straightWidth;
    if (distance <= cornerArc) return corner(left + width - radius, top + radius, -Math.PI / 2, distance / cornerArc);
    distance -= cornerArc;
    if (distance <= straightHeight) return { x: left + width, y: top + radius + distance };
    distance -= straightHeight;
    if (distance <= cornerArc) return corner(left + width - radius, top + height - radius, 0, distance / cornerArc);
    distance -= cornerArc;
    if (distance <= straightWidth) return { x: left + width - radius - distance, y: top + height };
    distance -= straightWidth;
    if (distance <= cornerArc) return corner(left + radius, top + height - radius, Math.PI / 2, distance / cornerArc);
    distance -= cornerArc;
    if (distance <= straightHeight) return { x: left, y: top + height - radius - distance };
    return corner(left + radius, top + radius, Math.PI, distance / cornerArc);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current, container = containerRef.current, context = canvas?.getContext("2d");
    if (!canvas || !container || !context) return undefined;
    const offset = 60;
    let size = { width: 0, height: 0 }, dpr = 1;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      size = { width: rect.width + offset * 2, height: rect.height + offset * 2 };
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size.width * dpr;
      canvas.height = size.height * dpr;
      canvas.style.width = `${size.width}px`;
      canvas.style.height = `${size.height}px`;
    };
    const draw = (currentTime: number) => {
      const delta = (currentTime - lastFrameTimeRef.current) / 1000;
      timeRef.current += delta * speed;
      lastFrameTimeRef.current = currentTime;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, size.width, size.height);
      const width = size.width - offset * 2, height = size.height - offset * 2, radius = Math.min(borderRadius, Math.min(width, height) / 2);
      const samples = Math.max(40, Math.floor((2 * (width + height) + 2 * Math.PI * radius) / 2));
      context.beginPath();
      for (let index = 0; index <= samples; index += 1) {
        const progress = index / samples, point = roundedPoint(progress, offset, offset, width, height, radius);
        const x = point.x + octave(progress * 8, timeRef.current, 0) * 60, y = point.y + octave(progress * 8, timeRef.current, 1) * 60;
        if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.closePath();
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
      animationRef.current = requestAnimationFrame(draw);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    animationRef.current = requestAnimationFrame(draw);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); observer.disconnect(); };
  }, [borderRadius, color, octave, roundedPoint, speed]);

  const variables = { "--electric-border-color": color, borderRadius } as CSSProperties;
  return <div ref={containerRef} className={`electric-border ${className}`} style={{ ...variables, ...style }}><div className="eb-canvas-container"><canvas ref={canvasRef} className="eb-canvas" /></div><div className="eb-layers"><div className="eb-glow-1" /><div className="eb-glow-2" /><div className="eb-background-glow" /></div><div className="eb-content">{children}</div></div>;
}
