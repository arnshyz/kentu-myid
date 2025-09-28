// src/components/BackgroundParticles.jsx
import React, { useRef, useEffect } from "react";

export default function BackgroundParticles({ count = 60 }) {
  const ref = useRef(null);
  const anim = useRef(0);
  const particles = useRef([]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width  = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    // init particles
    const W = () => canvas.width, H = () => canvas.height;
    particles.current = new Array(count).fill(0).map(() => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: 0.6 + Math.random() * 1.6,
      a: 0.15 + Math.random() * 0.2,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25
    }));

    function tick() {
      anim.current = requestAnimationFrame(tick);
      ctx.clearRect(0,0,W(),H());

      // subtle vignette
      const grad = ctx.createRadialGradient(W()/2,H()/2,0,W()/2,H()/2,Math.max(W(),H())/1.2);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.06)");
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,W(),H());

      // particles
      for (const p of particles.current) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W()) p.vx *= -1;
        if (p.y < 0 || p.y > H()) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(31,27,26,${p.a})`; // warna gelap senada logo
        ctx.fill();
      }

      // connecting lines (tipis)
      ctx.strokeStyle = "rgba(31,27,26,0.08)";
      for (let i=0; i<particles.current.length; i++){
        for (let j=i+1; j<i+10 && j<particles.current.length; j++){
          const a = particles.current[i], b = particles.current[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist2 = dx*dx + dy*dy;
          if (dist2 < 180*180) {
            ctx.globalAlpha = 1 - dist2 / (180*180);
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }
    tick();

    return () => {
      cancelAnimationFrame(anim.current);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
