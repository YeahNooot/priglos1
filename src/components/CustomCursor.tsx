/**
 * ═══════════════════════════════════════════════════════
 * КАСТОМНЫЙ КУРСОР
 * 3D-сфера с trail-эффектом
 * ═══════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  id: number;
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const trailId = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Добавляем точку trail
      trailId.current += 1;
      setTrail((prev) => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: trailId.current }];
        // Ограничиваем длину trail
        if (newTrail.length > 12) {
          return newTrail.slice(-12);
        }
        return newTrail;
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('magnetic-btn')
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    // Плавное следование курсора
    let animFrame: number;
    const animateCursor = () => {
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.15;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cursorPos.current.x - 10}px, ${cursorPos.current.y - 10}px)`;
      }

      animFrame = requestAnimationFrame(animateCursor);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    animFrame = requestAnimationFrame(animateCursor);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <>
      {/* Основной курсор */}
      <div
        ref={cursorRef}
        className="custom-cursor"
        style={{
          width: isHovering ? '40px' : '20px',
          height: isHovering ? '40px' : '20px',
          opacity: isHovering ? 0.6 : 0.8,
          transition: 'width 0.3s ease, height 0.3s ease, opacity 0.3s ease',
        }}
      />

      {/* Trail эффект */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="cursor-trail"
          style={{
            left: point.x - 4,
            top: point.y - 4,
            opacity: (index / trail.length) * 0.4,
            width: `${4 + (index / trail.length) * 4}px`,
            height: `${4 + (index / trail.length) * 4}px`,
            transform: `scale(${0.5 + (index / trail.length) * 0.5})`,
          }}
        />
      ))}
    </>
  );
}
