'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Helper to normalize colors for alpha support and add semi-transparency
function normalizeColorWithAlpha(color: string, alpha: string = '80'): string {
  // Handle rgba/rgb colors - extract and adjust alpha
  if (color.startsWith('rgba')) {
    // Already has alpha, just return as-is (reducing the alpha slightly)
    return color.replace(/rgba\((.+),\s*([0-9.]+)\)/, (_, rgb, a) => {
      const newAlpha = Math.max(0, parseFloat(a) - 0.3);
      return `rgba(${rgb}, ${newAlpha.toFixed(2)})`;
    });
  }
  if (color.startsWith('rgb')) {
    // Convert rgb to rgba with desired alpha
    return color.replace(/rgb\((.+)\)/, `rgba($1, 0.5)`);
  }
  
  // Handle hex colors
  if (!color.startsWith('#')) return color;
  const hex = color.slice(1);
  if (hex.length === 3) {
    // #fff -> #ffffff80
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}${alpha}`;
  }
  if (hex.length === 4) {
    // Already has alpha, return as 8-char hex
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  if (hex.length === 6) {
    // #ffffff -> #ffffff80
    return `#${hex}${alpha}`;
  }
  // Already 8 chars
  return color;
}

// Helper to normalize hex colors to 6-character format
function normalizeHexColor(color: string): string {
  // Handle rgba/rgb colors - return as-is
  if (color.startsWith('rgba') || color.startsWith('rgb')) return color;
  
  if (!color.startsWith('#')) return color;
  const hex = color.slice(1);
  if (hex.length === 3) {
    // #fff -> #ffffff
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  if (hex.length === 4) {
    // #fffa -> #ffffffaa
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return color;
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

type GravityStarsBackgroundProps = React.ComponentProps<'div'> & {
  /** Number of stars to render */
  starsCount?: number;
  /** Size of stars in pixels */
  starsSize?: number;
  /** Opacity of stars (0-1) */
  starsOpacity?: number;
  /** Glow intensity around stars */
  glowIntensity?: number;
  /** How glow animation responds - 'instant' or 'ease' */
  glowAnimation?: 'instant' | 'ease';
  /** Speed of star movement */
  movementSpeed?: number;
  /** Radius of mouse influence in pixels */
  mouseInfluence?: number;
  /** Whether mouse attracts or repels stars */
  mouseGravity?: 'attract' | 'repel';
  /** Strength of gravity effect */
  gravityStrength?: number;
  /** Whether stars interact with each other */
  starsInteraction?: boolean;
  /** Type of star interaction - 'bounce' or 'merge' */
  starsInteractionType?: 'bounce' | 'merge';
  /** Star color */
  starColor?: string;
};

function GravityStarsBackground({
  children,
  className,
  starsCount = 75,
  starsSize = 2,
  starsOpacity = 0.75,
  glowIntensity = 15,
  glowAnimation = 'ease',
  movementSpeed = 0.3,
  mouseInfluence = 100,
  mouseGravity = 'attract',
  gravityStrength = 75,
  starsInteraction = false,
  starsInteractionType = 'bounce',
  starColor = '#fff',
  ...props
}: GravityStarsBackgroundProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const starsRef = React.useRef<Star[]>([]);
  const mouseRef = React.useRef({ x: -1000, y: -1000 });
  const animationRef = React.useRef<number | undefined>(undefined);

  // Initialize stars
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initStars = () => {
      const stars: Star[] = [];
      for (let i = 0; i < starsCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * movementSpeed,
          vy: (Math.random() - 0.5) * movementSpeed,
          size: starsSize + Math.random() * starsSize,
          opacity: starsOpacity * (0.5 + Math.random() * 0.5),
        });
      }
      starsRef.current = stars;
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initStars();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [starsCount, starsSize, starsOpacity, movementSpeed]);

  // Animation loop
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const stars = starsRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Apply mouse gravity
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseInfluence && distance > 0) {
          const force = (gravityStrength / 1000) * (1 - distance / mouseInfluence);
          const angle = Math.atan2(dy, dx);
          const gravityMultiplier = mouseGravity === 'attract' ? 1 : -1;
          star.vx += Math.cos(angle) * force * gravityMultiplier;
          star.vy += Math.sin(angle) * force * gravityMultiplier;
        }

        // Apply velocity with damping
        star.vx *= 0.99;
        star.vy *= 0.99;

        // Update position
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        // Star interaction
        if (starsInteraction) {
          for (let j = i + 1; j < stars.length; j++) {
            const other = stars[j];
            const sdx = other.x - star.x;
            const sdy = other.y - star.y;
            const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
            const minDist = star.size + other.size;

            if (sdist < minDist && sdist > 0) {
              if (starsInteractionType === 'bounce') {
                // Bounce off each other
                const angle = Math.atan2(sdy, sdx);
                const overlap = minDist - sdist;
                star.x -= Math.cos(angle) * overlap * 0.5;
                star.y -= Math.sin(angle) * overlap * 0.5;
                other.x += Math.cos(angle) * overlap * 0.5;
                other.y += Math.sin(angle) * overlap * 0.5;

                // Exchange velocities
                const tempVx = star.vx;
                const tempVy = star.vy;
                star.vx = other.vx * 0.8;
                star.vy = other.vy * 0.8;
                other.vx = tempVx * 0.8;
                other.vy = tempVy * 0.8;
              }
            }
          }
        }

        // Calculate glow based on velocity
        const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
        const glowSize = glowAnimation === 'instant' 
          ? glowIntensity * Math.min(speed * 5, 1)
          : glowIntensity * Math.min(speed * 2, 1);

        // Draw star with glow
        if (glowSize > 0) {
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size + glowSize
          );
          const normalizedColor = normalizeHexColor(starColor);
          const semiTransparentColor = normalizeColorWithAlpha(starColor, '80');
          gradient.addColorStop(0, normalizedColor);
          gradient.addColorStop(0.4, semiTransparentColor);
          gradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size + glowSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Draw star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.globalAlpha = star.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    mouseInfluence,
    mouseGravity,
    gravityStrength,
    starsInteraction,
    starsInteractionType,
    glowIntensity,
    glowAnimation,
    starColor,
  ]);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }
    },
    []
  );

  const handleMouseLeave = React.useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  return (
    <div
      data-slot="gravity-stars-background"
      className={cn(
        'relative size-full overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_#1a1a2e_0%,_#0a0a0f_100%)]',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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

export { GravityStarsBackground, type GravityStarsBackgroundProps };
