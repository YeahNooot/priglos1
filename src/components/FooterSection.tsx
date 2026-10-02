/**
 * ═══════════════════════════════════════════════════════
 * ФУТЕР
 * Парящие 3D-кольца, звёздное небо, финальное послание
 * ═══════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createRenderer, createWeddingRings, handleResize } from '../utils/three-helpers';

interface FooterSectionProps {
  scrollProgress: number;
}

export default function FooterSection({ scrollProgress }: FooterSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());

  // Three.js — кольца и звёзды
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    const renderer = createRenderer(canvas, container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xFFF9F0, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xC9A96E, 1.5, 15);
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xD4A0A0, 0.8, 10);
    pointLight2.position.set(-2, -1, 2);
    scene.add(pointLight2);

    // Свадебные кольца
    const rings = createWeddingRings();
    rings.scale.set(0.6, 0.6, 0.6);
    rings.position.y = 0.5;
    scene.add(rings);

    // Звёзды
    const starCount = 500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const starPhases = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      starPositions[i3] = (Math.random() - 0.5) * 40;
      starPositions[i3 + 1] = (Math.random() - 0.5) * 30;
      starPositions[i3 + 2] = -10 - Math.random() * 20;
      starSizes[i] = Math.random() * 3 + 0.5;
      starPhases[i] = Math.random();
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
    starGeometry.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      color: 0xFFFFFF,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Золотая пыль
    const dustCount = 100;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      const i3 = i * 3;
      dustPositions[i3] = (Math.random() - 0.5) * 10;
      dustPositions[i3 + 1] = (Math.random() - 0.5) * 8;
      dustPositions[i3 + 2] = (Math.random() - 0.5) * 5;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const dustMaterial = new THREE.PointsMaterial({
      size: 0.03,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.4,
      color: 0xC9A96E,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    // Ресайз
    const onResize = () => {
      handleResize(renderer, camera, container);
    };
    window.addEventListener('resize', onResize);

    // Анимация
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      // Вращение колец
      rings.rotation.y = elapsed * 0.3;
      rings.rotation.x = Math.sin(elapsed * 0.2) * 0.1;
      rings.position.y = 0.5 + Math.sin(elapsed * 0.5) * 0.1;

      // Мерцание звёзд
      const starPos = stars.geometry.attributes.position;
      for (let i = 0; i < starPos.count; i++) {
        const i3 = i * 3;
        const arr = starPos.array as Float32Array;
        arr[i3] += Math.sin(elapsed * 0.1 + i * 0.01) * 0.001;
        arr[i3 + 1] += Math.cos(elapsed * 0.08 + i * 0.01) * 0.001;
      }
      starPos.needsUpdate = true;

      // Анимация золотой пыли
      const dustPos = dust.geometry.attributes.position;
      for (let i = 0; i < dustPos.count; i++) {
        const i3 = i * 3;
        const arr = dustPos.array as Float32Array;
        arr[i3] += Math.sin(elapsed * 0.5 + i * 0.2) * 0.005;
        arr[i3 + 1] += Math.cos(elapsed * 0.3 + i * 0.15) * 0.003;
        arr[i3 + 2] += Math.sin(elapsed * 0.4 + i * 0.1) * 0.002;
      }
      dustPos.needsUpdate = true;

      // Мерцание материала звёзд
      (stars.material as THREE.PointsMaterial).opacity = 0.5 + Math.sin(elapsed) * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Генерация CSS-звёзд
  const cssStars = Array.from({ length: 80 }).map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: `${2 + Math.random() * 4}s`,
    delay: `${Math.random() * 3}s`,
    size: `${1 + Math.random() * 2}px`,
  }));

  return (
    <footer
      ref={containerRef}
      className="footer-section"
      id="footer"
    >
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* CSS-звёзды */}
      <div className="footer-stars" style={{ zIndex: 2 }}>
        {cssStars.map((star, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: star.left,
              top: star.top,
              '--duration': star.duration,
              '--delay': star.delay,
              width: star.size,
              height: star.size,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Контент */}
      <div className="relative z-10 text-center px-4">
        {/* Финальное послание */}
        <div className="mb-8" style={{ opacity: 0.5 + scrollProgress * 0.5 }}>
          <p className="footer-message">
            С любовью и благодарностью
          </p>
          <p className="footer-submessage mt-4">
            Ждём вас на нашем празднике
          </p>
        </div>

        {/* Имена */}
        <div className="my-8">
          <h3
            className="text-3xl md:text-5xl text-[#C9A96E] animate-glow"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            Андрей & Полина
          </h3>
          <p className="text-[#C9A96E]/60 mt-2 tracking-[0.3em] font-heading text-lg">
            27 . 07 . 2027
          </p>
        </div>

        {/* Разделитель */}
        <div className="gold-divider-wide" style={{ opacity: 0.5 }} />

        {/* Дополнительная информация */}
        <div className="mt-8 space-y-2">
          <p className="text-white/40 text-sm font-body">
            г. Рязань, Россия
          </p>
          <p className="text-white/30 text-xs font-body tracking-wider">
            Сделано с любовью ♥
          </p>
        </div>

        {/* Кольца CSS (декоративные) */}
        <div className="mt-12 flex justify-center">
          <div className="relative w-16 h-16">
            <div
              className="absolute inset-0 border-2 border-[#C9A96E]/40 rounded-full"
              style={{ animation: 'rotate360 8s linear infinite' }}
            />
            <div
              className="absolute inset-2 border-2 border-[#D4A0A0]/40 rounded-full"
              style={{ animation: 'rotateReverse 6s linear infinite' }}
            />
            <div
              className="absolute inset-4 border border-[#C9A96E]/20 rounded-full"
              style={{ animation: 'rotate360 10s linear infinite' }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
