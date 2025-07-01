
import React, { useEffect, useRef } from 'react';
import './animated-background.scss';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const createParticles = () => {
      const particles: Particle[] = [];
      const particleCount = Math.min(150, Math.floor((canvas.width * canvas.height) / 8000));
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.1,
          hue: Math.random() * 60 + 200, // Blue to purple range
        });
      }
      return particles;
    };

    particlesRef.current = createParticles();

    const animate = (time: number) => {
      ctx.fillStyle = 'rgba(23, 23, 23, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(34, 39, 41, 0.8)');
      gradient.addColorStop(0.5, 'rgba(23, 23, 23, 0.9)');
      gradient.addColorStop(1, 'rgba(10, 10, 10, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animate particles
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Animate opacity
        particle.opacity = 0.1 + 0.4 * (Math.sin(time * 0.001 + index * 0.1) + 1) / 2;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
        ctx.fill();

        // Draw connections between nearby particles
        particlesRef.current.forEach((otherParticle, otherIndex) => {
          if (index >= otherIndex) return;
          
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.2;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `hsla(220, 50%, 50%, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Add floating orbs
      const orbCount = 3;
      for (let i = 0; i < orbCount; i++) {
        const orbTime = time * 0.0005 + i * 2;
        const x = canvas.width / 2 + Math.cos(orbTime) * (200 + i * 100);
        const y = canvas.height / 2 + Math.sin(orbTime * 0.7) * (150 + i * 80);
        const size = 40 + Math.sin(time * 0.003 + i) * 20;
        
        const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        orbGradient.addColorStop(0, `hsla(${220 + i * 20}, 80%, 60%, 0.3)`);
        orbGradient.addColorStop(0.7, `hsla(${220 + i * 20}, 80%, 40%, 0.1)`);
        orbGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = orbGradient;
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="animated-background-container">
      <canvas
        ref={canvasRef}
        className="animated-background"
      />
      <div className="background-text">
        <span className="letter-white">M</span>
        <span className="letter-blue">A</span>
        <span className="letter-blue">i</span>
        <span className="letter-white">A</span>
        <span className="letter-white"> Live!</span>
      </div>
    </div>
  );
};
