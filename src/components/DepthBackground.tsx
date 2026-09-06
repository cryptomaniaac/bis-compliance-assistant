'use client';

import { useEffect, useRef } from 'react';

export default function DepthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = Math.max(canvas.parentElement?.clientWidth || window.innerWidth || 800, 100);
    let height = Math.max(canvas.parentElement?.clientHeight || window.innerHeight || 600, 100);
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = Math.max(canvas.parentElement.clientWidth || window.innerWidth || 800, 100);
      height = Math.max(canvas.parentElement.clientHeight || window.innerHeight || 600, 100);
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    // Constellation Particle Mesh
    const count = 35;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.4 ? 'rgba(232, 197, 106, ' : 'rgba(208, 74, 12, ',
      opacity: Math.random() * 0.35 + 0.15,
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      if (width <= 0 || height <= 0) {
        animFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Render floating particle mesh connections
      for (let i = 0; i < count; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p1.color}${p1.opacity})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < count; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / 120) * 0.15;
            ctx.strokeStyle = `rgba(168, 115, 42, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Dynamic mouse ambient light bloom with safe bounds
      const safeMX = Math.max(0, Math.min(width, mouseX || width / 2));
      const safeMY = Math.max(0, Math.min(height, mouseY || height / 2));
      try {
        const grad = ctx.createRadialGradient(safeMX, safeMY, 10, safeMX, safeMY, 350);
        grad.addColorStop(0, 'rgba(208, 74, 12, 0.07)');
        grad.addColorStop(0.5, 'rgba(45, 74, 122, 0.04)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } catch (e) {}

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
