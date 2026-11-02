import React, { useEffect, useState } from 'react';
import { PawIcon } from './PawIcon';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  opacity: number;
  rotation: number;
  color: string;
}

interface PawParticlesProps {
  triggerKey: number;
  originX?: number;
  originY?: number;
}

export const PawParticles: React.FC<PawParticlesProps> = ({
  triggerKey,
  originX,
  originY,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!triggerKey) return;

    const colors = ['#B69AFF', '#7047D7', '#FFD9E4', '#FFF8EE'];
    const startX = originX ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 200);
    const startY = originY ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 200);

    const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5;
      const speed = 2.5 + Math.random() * 3.5;
      return {
        id: Date.now() + i,
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        scale: 0.6 + Math.random() * 0.5,
        opacity: 1,
        rotation: (Math.random() - 0.5) * 60,
        color: colors[i % colors.length],
      };
    });

    setParticles(newParticles);

    let animationFrameId: number;
    let step = 0;

    const animate = () => {
      step++;
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.12, // soft gravity
            opacity: p.opacity - 0.025,
            rotation: p.rotation + 2,
          }))
          .filter((p) => p.opacity > 0)
      );

      if (step < 45) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setParticles([]);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [triggerKey, originX, originY]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}px`,
            top: `${p.y}px`,
            transform: `translate(-50%, -50%) scale(${p.scale}) rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            transition: 'opacity 0.05s linear',
          }}
        >
          <PawIcon size={24} fill={p.color} />
        </div>
      ))}
    </div>
  );
};
