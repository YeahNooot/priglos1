/**
 * ═══════════════════════════════════════════════════════
 * ПРЕЛОАДЕР — Кинематографическое вступление
 * 3D-кольца, частицы, обратный отсчёт
 * ═══════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { createRenderer, createWeddingRings, createSparkleSystem, createSceneFog, handleResize } from '../utils/three-helpers';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const ringsRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());

  // Расчёт обратного отсчёта до свадьбы
  const calculateCountdown = useCallback(() => {
    const weddingDate = new Date('2027-07-27T15:00:00');
    const now = new Date();
    const diff = weddingDate.getTime() - now.getTime();

    if (diff <= 0) {
      setCountdown('Сегодня!');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    setCountdown(`${days} дней ${hours} часов ${minutes} минут`);
  }, []);

  // Инициализация Three.js сцены
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Создание рендерера
    const renderer = createRenderer(canvas, container.clientWidth, container.clientHeight);
    rendererRef.current = renderer;

    // Создание сцены
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFAFAF8);
    sceneRef.current = scene;

    // Fog для глубины
    createSceneFog(scene, 0xFAFAF8, 5, 25);

    // Камера
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6);
    cameraRef.current = camera;

    // Освещение
    setupSceneLighting(scene);

    // Свадебные кольца
    const rings = createWeddingRings();
    rings.scale.set(0.8, 0.8, 0.8);
    scene.add(rings);
    ringsRef.current = rings;

    // Блёстки
    const sparkles = createSparkleSystem(500, 15);
    scene.add(sparkles);

    // Золотые частицы (облако)
    const goldParticles = createGoldCloud(300);
    scene.add(goldParticles);

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

      // Вращение колец
      if (ringsRef.current) {
        ringsRef.current.rotation.y = elapsed * 0.5;
        ringsRef.current.rotation.x = Math.sin(elapsed * 0.3) * 0.2;
        ringsRef.current.position.y = Math.sin(elapsed * 0.5) * 0.1;
      }

      // Анимация блёсток
      const sparklePositions = sparkles.geometry.attributes.position;
      for (let i = 0; i < sparklePositions.count; i++) {
        const i3 = i * 3;
        const arr = sparklePositions.array as Float32Array;
        arr[i3] += Math.sin(elapsed + i) * 0.002;
        arr[i3 + 1] += Math.cos(elapsed * 0.7 + i) * 0.001;
        arr[i3 + 2] += Math.sin(elapsed * 0.5 + i * 0.5) * 0.002;
      }
      sparklePositions.needsUpdate = true;

      // Анимация золотого облака
      const cloudPositions = goldParticles.geometry.attributes.position;
      for (let i = 0; i < cloudPositions.count; i++) {
        const i3 = i * 3;
        const arr = cloudPositions.array as Float32Array;
        arr[i3] += Math.sin(elapsed * 0.3 + i * 0.1) * 0.003;
        arr[i3 + 1] += Math.cos(elapsed * 0.2 + i * 0.15) * 0.002;
      }
      cloudPositions.needsUpdate = true;

      // Камера слегка покачивается
      camera.position.x = Math.sin(elapsed * 0.2) * 0.3;
      camera.position.y = Math.cos(elapsed * 0.15) * 0.2;
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
  }, []);

  // Прогресс загрузки (симуляция)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowButton(true), 500);
          return 100;
        }
        return prev + Math.random() * 3 + 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Обновление обратного отсчёта
  useEffect(() => {
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);
    return () => clearInterval(interval);
  }, [calculateCountdown]);

  // Обработка клика по кнопке
  const handleOpen = () => {
    setIsVisible(false);
    setTimeout(onComplete, 1000);
  };

  return (
    <div
      ref={containerRef}
      className={`preloader ${!isVisible ? 'hidden' : ''}`}
    >
      {/* Three.js canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Контент поверх canvas */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {/* Заголовок */}
        <h1
          className="font-script text-5xl md:text-7xl text-[#C9A96E] mb-4 animate-glow"
          style={{ fontFamily: "'Great Vibes', cursive" }}
        >
          Андрей & Полина
        </h1>

        {/* Дата */}
        <p className="font-heading text-xl md:text-2xl text-[#1A1A1A] tracking-[0.3em] mb-8 opacity-80">
          27 . 07 . 2027
        </p>

        {/* Обратный отсчёт */}
        <p className="text-sm text-[#6B6B6B] tracking-[0.15em] mb-6 font-body">
          До свадьбы: {countdown}
        </p>

        {/* Прогресс-бар */}
        <div className="preloader-progress">
          <div
            className="preloader-progress-bar"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Процент загрузки */}
        <p className="text-xs text-[#6B6B6B] mt-2 tracking-widest">
          {Math.min(Math.round(progress), 100)}%
        </p>

        {/* Кнопка открытия */}
        {showButton && (
          <button
            onClick={handleOpen}
            className="btn-gold mt-8 animate-fadeInUp magnetic-btn"
            style={{ animation: 'fadeInUp 0.8s ease forwards' }}
          >
            <span>Открыть приглашение</span>
          </button>
        )}
      </div>

      {/* Декоративные лепестки CSS */}
      <div className="particles-container" style={{ zIndex: 2 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="petal"
            style={{
              '--x': `${Math.random() * 100}%`,
              '--duration': `${8 + Math.random() * 6}s`,
              '--delay': `${Math.random() * 5}s`,
              background: i % 2 === 0 ? '#D4A0A0' : '#E8D5A3',
              opacity: 0.4 + Math.random() * 0.3,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Вспомогательная функция: создание золотого облака частиц ───
function createGoldCloud(count: number): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const goldColors = [
    new THREE.Color(0xC9A96E),
    new THREE.Color(0xD4AF37),
    new THREE.Color(0xE8D5A3),
  ];

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Распределение в форме облака/сферы
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 3 + Math.random() * 5;

    positions[i3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.5;
    positions[i3 + 2] = r * Math.cos(phi) - 5;

    const color = goldColors[Math.floor(Math.random() * goldColors.length)];
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.04,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.6,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

// ─── Вспомогательная: настройка освещения ───
function setupSceneLighting(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight(0xFFF9F0, 0.5);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xFFF5E6, 1.0);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const pointLight1 = new THREE.PointLight(0xC9A96E, 1.5, 15);
  pointLight1.position.set(-3, 2, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xD4A0A0, 1.0, 12);
  pointLight2.position.set(3, -1, 2);
  scene.add(pointLight2);

  const hemiLight = new THREE.HemisphereLight(0xFFF9F0, 0xF5F0EB, 0.3);
  scene.add(hemiLight);
}
