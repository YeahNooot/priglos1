/**
 * ═══════════════════════════════════════════════════════
 * HERO СЕКЦИЯ — Главный экран
 * Three.js-сцена с лепестками, 3D-типографика, параллакс
 * ═══════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createRenderer, createPetalSystem, createSparkleSystem, createSceneFog, handleResize, animateParticles } from '../utils/three-helpers';

interface HeroSectionProps {
  isMobile: boolean;
}

export default function HeroSection({ isMobile }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const petalsRef = useRef<THREE.Points | null>(null);
  const sparklesRef = useRef<THREE.Points | null>(null);
  const frameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());
  const mouseTarget = useRef({ x: 0, y: 0 });

  // Обработка движения мыши для параллакса
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseTarget.current = { x, y };
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Инициализация Three.js
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Рендерер
    const renderer = createRenderer(canvas, container.clientWidth, container.clientHeight);
    rendererRef.current = renderer;

    // Сцена
    const scene = new THREE.Scene();
    scene.background = null; // Прозрачный фон
    sceneRef.current = scene;

    // Fog
    createSceneFog(scene, 0xFAFAF8, 8, 30);

    // Камера
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xFFF9F0, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFF5E6, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(0xC9A96E, 1.2, 20);
    pointLight1.position.set(-5, 3, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xD4A0A0, 0.8, 15);
    pointLight2.position.set(5, -2, 3);
    scene.add(pointLight2);

    // Лепестки роз
    const petalCount = isMobile ? 200 : 500;
    const petals = createPetalSystem(petalCount, 20);
    scene.add(petals);
    petalsRef.current = petals;

    // Блёстки
    const sparkleCount = isMobile ? 100 : 300;
    const sparkles = createSparkleSystem(sparkleCount, 15);
    scene.add(sparkles);
    sparklesRef.current = sparkles;

    // Декоративные 3D-кольца на фоне
    const ringGeometry = new THREE.TorusGeometry(2, 0.03, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xC9A96E,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.3,
    });

    const rings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(ringGeometry, ringMaterial.clone());
      ring.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4,
        -5 - i * 3
      );
      ring.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0
      );
      ring.scale.setScalar(0.5 + Math.random() * 1.5);
      scene.add(ring);
      rings.push(ring);
    }

    // Обработка ресайза
    const onResize = () => {
      if (container && renderer && camera) {
        handleResize(renderer, camera, container);
      }
    };
    window.addEventListener('resize', onResize);

    // Анимационный цикл
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      // Анимация лепестков
      if (petalsRef.current) {
        animateParticles(petalsRef.current, elapsed, {
          windSpeed: 0.8,
          gravity: 0.01,
          turbulence: 0.5,
          bounds: 10,
        });
      }

      // Анимация блёсток
      if (sparklesRef.current) {
        const positions = sparklesRef.current.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const i3 = i * 3;
          const arr = positions.array as Float32Array;
          arr[i3] += Math.sin(elapsed * 0.5 + i * 0.2) * 0.005;
          arr[i3 + 1] += Math.cos(elapsed * 0.3 + i * 0.15) * 0.003;
          arr[i3 + 2] += Math.sin(elapsed * 0.4 + i * 0.1) * 0.004;
        }
        positions.needsUpdate = true;
        (sparklesRef.current.material as THREE.PointsMaterial).opacity = 
          0.5 + Math.sin(elapsed * 2) * 0.3;
      }

      // Вращение декоративных колец
      rings.forEach((ring, i) => {
        ring.rotation.x += 0.002 * (i + 1);
        ring.rotation.y += 0.003 * (i + 1);
      });

      // Параллакс камеры от мыши (8 слоёв глубины)
      const targetX = mouseTarget.current.x * 0.5;
      const targetY = mouseTarget.current.y * 0.3;
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (-targetY - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.clear();
    };
  }, [isMobile]);

  return (
    <section
      ref={containerRef}
      className="hero-section"
      id="hero"
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="hero-canvas"
      />

      {/* Многослойный параллакс фон (CSS) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
        {/* Слой 1 — дальний градиент */}
        <div
          className="absolute inset-0 parallax-bg"
          data-speed="0.1"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(201, 169, 110, 0.08) 0%, transparent 50%)',
            transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 5}px)`,
          }}
        />
        {/* Слой 2 */}
        <div
          className="absolute inset-0 parallax-bg"
          data-speed="0.2"
          style={{
            background: 'radial-gradient(ellipse at 70% 80%, rgba(212, 160, 160, 0.06) 0%, transparent 50%)',
            transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
          }}
        />
        {/* Слой 3 — декоративные круги */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full border border-[#C9A96E]/10 top-[-200px] left-[-200px] parallax-bg"
          data-speed="0.15"
          style={{ transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)` }}
        />
        {/* Слой 4 */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full border border-[#D4A0A0]/10 bottom-[-100px] right-[-100px] parallax-bg"
          data-speed="0.25"
          style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)` }}
        />
        {/* Слой 5 */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full bg-[#C9A96E]/[0.03] top-[20%] right-[10%] animate-breathe-slow parallax-bg"
          data-speed="0.3"
          style={{ transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)` }}
        />
        {/* Слой 6 */}
        <div
          className="absolute w-[200px] h-[200px] rounded-full bg-[#D4A0A0]/[0.04] bottom-[30%] left-[15%] animate-float-slow parallax-bg"
          data-speed="0.35"
          style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)` }}
        />
        {/* Слой 7 — золотые точки */}
        <div
          className="absolute inset-0 parallax-bg"
          data-speed="0.4"
          style={{ transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 35}px)` }}
        >
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#C9A96E]/30 animate-twinkle"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        {/* Слой 8 — ближний */}
        <div
          className="absolute inset-0 parallax-bg"
          data-speed="0.5"
          style={{ transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)` }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#D4A0A0]/20 animate-float"
              style={{
                left: `${5 + Math.random() * 90}%`,
                top: `${5 + Math.random() * 90}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${5 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className="hero-content" style={{ zIndex: 10 }}>
        {/* Верхний декоративный элемент */}
        <div className="flex items-center justify-center gap-4 mb-6 animate-title">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#C9A96E]" />
          <span className="text-[#C9A96E] text-sm tracking-[0.3em] uppercase font-body">Приглашение на свадьбу</span>
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#C9A96E]" />
        </div>

        {/* Имена */}
        <h1 className="hero-names animate-title">
          <span className="inline-block" style={{ animation: 'fadeInUp 1s ease 0.2s both' }}>Полина</span>
          <span className="ampersand" style={{ animation: 'fadeInUp 1s ease 0.4s both' }}>&</span>
          <span className="inline-block" style={{ animation: 'fadeInUp 1s ease 0.6s both' }}>Андрей</span>
        </h1>

        {/* Дата */}
        <div className="hero-date animate-title" style={{ animation: 'fadeInUp 1s ease 0.8s both' }}>
          <span className="inline-block">27</span>
          <span className="mx-2 text-[#D4A0A0]">•</span>
          <span className="inline-block">07</span>
          <span className="mx-2 text-[#D4A0A0]">•</span>
          <span className="inline-block">2027</span>
        </div>

        {/* Подзаголовок */}
        <p className="hero-subtitle animate-title" style={{ animation: 'fadeInUp 1s ease 1s both' }}>
          Рязань, Россия
        </p>

        {/* Декоративный разделитель */}
        <div className="mt-8 animate-title" style={{ animation: 'fadeInUp 1s ease 1.2s both' }}>
          <div className="ornament-divider">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#C9A96E]">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Индикатор скролла */}
      <div className="hero-scroll-indicator" style={{ zIndex: 10 }}>
        <span>Листайте вниз</span>
        <div className="scroll-line" />
      </div>

      {/* CSS-лепестки (дополнительный слой) */}
      <div className="particles-container" style={{ zIndex: 3 }}>
        {Array.from({ length: isMobile ? 10 : 25 }).map((_, i) => (
          <div
            key={`petal-${i}`}
            className="petal"
            style={{
              '--x': `${Math.random() * 100}%`,
              '--duration': `${10 + Math.random() * 8}s`,
              '--delay': `${Math.random() * 8}s`,
              width: `${10 + Math.random() * 15}px`,
              height: `${15 + Math.random() * 20}px`,
              background: i % 3 === 0 ? '#D4A0A0' : i % 3 === 1 ? '#E8B4B4' : '#F0D4D4',
              opacity: 0.3 + Math.random() * 0.4,
              borderRadius: '50% 0 50% 50%',
            } as React.CSSProperties}
          />
        ))}
      </div>
    </section>
  );
}
