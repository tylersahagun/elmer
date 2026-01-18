'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type HoleBackgroundProps = React.ComponentProps<'div'> & {
  /** Color of the grid lines */
  strokeColor?: string;
  /** Number of horizontal/vertical lines in the grid */
  numberOfLines?: number;
  /** Number of concentric discs */
  numberOfDiscs?: number;
  /** RGB color array for particles [r, g, b] */
  particleRGBColor?: [number, number, number];
};

interface Particle {
  x: number;
  y: number;
  z: number;
  vz: number;
  size: number;
}

function HoleBackground({
  children,
  className,
  strokeColor = '#737373',
  numberOfLines = 50,
  numberOfDiscs = 50,
  particleRGBColor = [255, 255, 255],
  ...props
}: HoleBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const particlesRef = React.useRef<Particle[]>([]);
  const animationRef = React.useRef<number | undefined>(undefined);
  const timeRef = React.useRef(0);

  // Initialize particles
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initParticles = () => {
      const particles: Particle[] = [];
      const particleCount = 100;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * canvas.width * 0.4;
        particles.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: Math.random() * 1000,
          vz: 2 + Math.random() * 3,
          size: 1 + Math.random() * 2,
        });
      }
      particlesRef.current = particles;
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Animation loop
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const animate = () => {
      timeRef.current += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines (perspective effect)
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.5;

      // Horizontal lines with perspective
      for (let i = 0; i < numberOfLines; i++) {
        const progress = i / numberOfLines;
        const y = centerY + (progress - 0.5) * canvas.height * 2;
        const perspective = 1 - Math.abs(progress - 0.5) * 1.5;
        
        if (perspective > 0) {
          ctx.globalAlpha = perspective * 0.3;
          ctx.beginPath();
          
          // Create curved line toward center
          const curveAmount = Math.sin(timeRef.current + i * 0.1) * 20;
          ctx.moveTo(0, y + curveAmount);
          ctx.quadraticCurveTo(
            centerX, 
            y - (y - centerY) * 0.3 + curveAmount,
            canvas.width, 
            y + curveAmount
          );
          ctx.stroke();
        }
      }

      // Vertical lines with perspective
      for (let i = 0; i < numberOfLines; i++) {
        const progress = i / numberOfLines;
        const x = progress * canvas.width;
        const perspective = 1 - Math.abs(progress - 0.5) * 1.5;
        
        if (perspective > 0) {
          ctx.globalAlpha = perspective * 0.3;
          ctx.beginPath();
          
          const curveAmount = Math.cos(timeRef.current + i * 0.1) * 20;
          ctx.moveTo(x + curveAmount, 0);
          ctx.quadraticCurveTo(
            x - (x - centerX) * 0.3 + curveAmount,
            centerY,
            x + curveAmount,
            canvas.height
          );
          ctx.stroke();
        }
      }

      // Draw concentric discs (the "hole" effect)
      for (let i = 0; i < numberOfDiscs; i++) {
        const progress = i / numberOfDiscs;
        const radius = progress * Math.min(canvas.width, canvas.height) * 0.4;
        const pulseOffset = Math.sin(timeRef.current * 2 + i * 0.2) * 5;
        
        ctx.globalAlpha = (1 - progress) * 0.15;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + pulseOffset, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw particles being pulled into the hole
      const particles = particlesRef.current;
      const [r, g, b] = particleRGBColor;

      for (const particle of particles) {
        // Update particle position (moving toward viewer)
        particle.z -= particle.vz;
        
        // Reset particle when it passes through
        if (particle.z < 1) {
          particle.z = 1000;
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * canvas.width * 0.4;
          particle.x = Math.cos(angle) * radius;
          particle.y = Math.sin(angle) * radius;
        }

        // Calculate 3D to 2D projection
        const scale = 500 / particle.z;
        const screenX = centerX + particle.x * scale;
        const screenY = centerY + particle.y * scale;
        const size = particle.size * scale;

        // Only draw if on screen
        if (screenX > 0 && screenX < canvas.width && 
            screenY > 0 && screenY < canvas.height && size > 0.5) {
          const alpha = Math.min(1, (1000 - particle.z) / 500);
          ctx.globalAlpha = alpha * 0.8;
          
          // Draw particle with glow
          const gradient = ctx.createRadialGradient(
            screenX, screenY, 0,
            screenX, screenY, size * 2
          );
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
          gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.3)`);
          gradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.arc(screenX, screenY, size * 2, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      // Draw central dark hole
      const holeGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 80
      );
      holeGradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
      holeGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.8)');
      holeGradient.addColorStop(1, 'transparent');
      
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
      ctx.fillStyle = holeGradient;
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [strokeColor, numberOfLines, numberOfDiscs, particleRGBColor]);

  return (
    <div
      data-slot="hole-background"
      className={cn(
        'relative size-full overflow-hidden bg-[radial-gradient(ellipse_at_center,_#0f0f1a_0%,_#000_100%)]',
        className
      )}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {children}
    </div>
  );
}

export { HoleBackground, type HoleBackgroundProps };
