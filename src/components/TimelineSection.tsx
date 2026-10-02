/**
 * ═══════════════════════════════════════════════════════
 * СЕКЦИЯ «НАША ИСТОРИЯ» — Timeline
 * 3D-карточки, светлячки, параллакс
 * ═══════════════════════════════════════════════════════
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createRenderer, createFireflySystem, createSceneFog, handleResize } from '../utils/three-helpers';

// Данные таймлайна
const timelineData = [
  {
    year: '2022',
    event: 'Первая встреча',
    description: 'Случайная встреча, которая изменила всё. Судьба свела нас в самый неожиданный момент.',
    icon: '✨',
  },
  {
    year: '2022',
    event: 'Первое свидание',
    description: 'Прогулка по вечернему городу, бесконечные разговоры и понимание — это начало чего-то особенного.',
    icon: '🌹',
  },
  {
    year: '2023',
    event: 'Первое путешествие',
    description: 'Вместе открыли новые горизонты. Путешествие, которое показало — мы созданы друг для друга.',
    icon: '✈️',
  },
  {
    year: '2024',
    event: 'Переезд вместе',
    description: 'Начало совместной жизни. Каждый день вместе — это маленькое счастье.',
    icon: '🏡',
  },
  {
    year: '2025',
    event: 'Предложение',
    description: 'Самый волнительный момент. Один вопрос, одно «Да» — и вся жизнь впереди.',
    icon: '💍',
  },
  {
    year: '2027',
    event: 'Свадьба',
    description: '27 июля 2027 — день, когда мы скажем «Да» перед всеми, кого любим. Начало нашей вечности.',
    icon: '👰',
  },
];

export default function TimelineSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());

  // Three.js — светлячки на фоне
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    const renderer = createRenderer(canvas, container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    createSceneFog(scene, 0xFAFAF8, 10, 40);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 10);

    // Светлячки
    const fireflies = createFireflySystem(200, 20);
    scene.add(fireflies);

    // Декоративная спираль
    const spiralPoints: THREE.Vector3[] = [];
    for (let i = 0; i < 200; i++) {
      const t = i / 200;
      const angle = t * Math.PI * 6;
      const radius = 2 + t * 3;
      spiralPoints.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        t * 10 - 5,
        Math.sin(angle) * radius - 10
      ));
    }

    const spiralGeometry = new THREE.BufferGeometry().setFromPoints(spiralPoints);
    const spiralMaterial = new THREE.LineBasicMaterial({
      color: 0xC9A96E,
      transparent: true,
      opacity: 0.15,
    });
    const spiralLine = new THREE.Line(spiralGeometry, spiralMaterial);
    scene.add(spiralLine);

    // Золотые точки на спирали
    const dotGeometry = new THREE.BufferGeometry();
    const dotPositions = new Float32Array(20 * 3);
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      const angle = t * Math.PI * 6;
      const radius = 2 + t * 3;
      dotPositions[i * 3] = Math.cos(angle) * radius;
      dotPositions[i * 3 + 1] = t * 10 - 5;
      dotPositions[i * 3 + 2] = Math.sin(angle) * radius - 10;
    }
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
    const dotMaterial = new THREE.PointsMaterial({
      color: 0xD4AF37,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const dots = new THREE.Points(dotGeometry, dotMaterial);
    scene.add(dots);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xFFF9F0, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xC9A96E, 0.5, 20);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // Ресайз
    const onResize = () => {
      if (container && renderer && camera) {
        handleResize(renderer, camera, container);
      }
    };
    window.addEventListener('resize', onResize);

    // Анимация
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      // Анимация светлячков
      const positions = fireflies.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const i3 = i * 3;
        const arr = positions.array as Float32Array;
        arr[i3] += Math.sin(elapsed * 0.5 + i * 0.3) * 0.01;
        arr[i3 + 1] += Math.cos(elapsed * 0.3 + i * 0.2) * 0.008;
        arr[i3 + 2] += Math.sin(elapsed * 0.4 + i * 0.1) * 0.005;
      }
      positions.needsUpdate = true;

      // Вращение спирали
      spiralLine.rotation.y = elapsed * 0.1;
      dots.rotation.y = elapsed * 0.1;

      // Мерцание точек
      (dots.material as THREE.PointsMaterial).opacity = 0.4 + Math.sin(elapsed * 2) * 0.2;

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

  return (
    <section
      ref={containerRef}
      className="section timeline-section"
      id="timeline"
    >
      {/* Three.js canvas на фоне */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Контент */}
      <div className="section-content" style={{ zIndex: 10 }}>
        {/* Заголовок */}
        <div className="text-center mb-16">
          <p className="text-sm tracking-[0.3em] uppercase text-[#C9A96E] mb-4 font-body animate-title">
            Путь к сердцу
          </p>
          <h2 className="text-4xl md:text-6xl font-display text-[#0D0D0D] animate-title">
            Наша история
          </h2>
          <div className="gold-divider mt-6" />
        </div>

        {/* Timeline */}
        <div className="timeline-container">
          <div className="timeline-line" />

          {timelineData.map((item, index) => (
            <div
              key={index}
              className="timeline-item"
            >
              <div className="timeline-dot" />
              <div className="timeline-card">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="timeline-year">{item.year}</div>
                <div className="timeline-event">{item.event}</div>
                <div className="timeline-description">{item.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Светлячки CSS */}
      <div className="particles-container" style={{ zIndex: 2 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={`firefly-${i}`}
            className="firefly-particle"
            style={{
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--duration': `${4 + Math.random() * 4}s`,
              '--delay': `${Math.random() * 5}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </section>
  );
}
