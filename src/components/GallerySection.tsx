/**
 * ═══════════════════════════════════════════════════════
 * СЕКЦИЯ «ГАЛЕРЕЯ»
 * 3D-карусель фотографий, глубина резкости
 * ═══════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createRenderer, createSparkleSystem, handleResize } from '../utils/three-helpers';

// Placeholder данные для галереи
const galleryItems = [
  { id: 1, title: 'Наша весна', color: '#F0D4D4' },
  { id: 2, title: 'Летний день', color: '#E8D5A3' },
  { id: 3, title: 'Осенняя прогулка', color: '#D4A0A0' },
  { id: 4, title: 'Зимняя сказка', color: '#C4D4E8' },
  { id: 5, title: 'Первое путешествие', color: '#D4E8C4' },
  { id: 6, title: 'Предложение', color: '#E8D4E8' },
  { id: 7, title: 'Наш дом', color: '#F5E0D0' },
  { id: 8, title: 'Счастливые моменты', color: '#D4E0E8' },
];

export default function GallerySection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Three.js — фоновые частицы
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
      50
    );
    camera.position.set(0, 0, 12);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xFFF9F0, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xC9A96E, 1.0, 20);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // Блёстки
    const sparkles = createSparkleSystem(150, 15);
    scene.add(sparkles);

    // Декоративные кольца
    const ringGeometry = new THREE.TorusGeometry(3, 0.02, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xC9A96E,
      transparent: true,
      opacity: 0.1,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.z = -5;
    scene.add(ring);

    // Ресайз
    const onResize = () => {
      handleResize(renderer, camera, container);
    };
    window.addEventListener('resize', onResize);

    // Анимация
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      // Анимация блёсток
      const positions = sparkles.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const i3 = i * 3;
        const arr = positions.array as Float32Array;
        arr[i3] += Math.sin(elapsed * 0.4 + i * 0.2) * 0.003;
        arr[i3 + 1] += Math.cos(elapsed * 0.3 + i * 0.15) * 0.002;
      }
      positions.needsUpdate = true;

      // Вращение кольца
      ring.rotation.x = elapsed * 0.1;
      ring.rotation.y = elapsed * 0.15;

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

  // Авто-вращение карусели
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % galleryItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  return (
    <section
      ref={containerRef}
      className="section gallery-section"
      id="gallery"
    >
      {/* Three.js canvas */}
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
            Моменты счастья
          </p>
          <h2 className="text-4xl md:text-6xl font-display text-[#0D0D0D] animate-title">
            Наша галерея
          </h2>
          <div className="gold-divider mt-6" />
        </div>

        {/* 3D-карусель */}
        <div
          className="gallery-carousel"
          onMouseEnter={() => setIsAutoRotating(false)}
          onMouseLeave={() => setIsAutoRotating(true)}
        >
          {galleryItems.map((item, index) => {
            // Расчёт позиции в карусели
            const total = galleryItems.length;
            let relativeIndex = index - activeIndex;
            
            // Нормализация для кругового списка
            if (relativeIndex > total / 2) relativeIndex -= total;
            if (relativeIndex < -total / 2) relativeIndex += total;

            const angle = (relativeIndex / total) * Math.PI * 2;
            const radius = 350;
            const x = Math.sin(angle) * radius;
            const z = Math.cos(angle) * radius - radius;
            const rotateY = (angle * 180) / Math.PI;
            const scale = 1 - Math.abs(relativeIndex) * 0.1;
            const opacity = 1 - Math.abs(relativeIndex) * 0.2;

            return (
              <div
                key={item.id}
                className="gallery-item"
                style={{
                  transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${Math.max(scale, 0.5)})`,
                  opacity: Math.max(opacity, 0.3),
                  zIndex: total - Math.abs(relativeIndex),
                  transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
                onClick={() => {
                  setActiveIndex(index);
                  setIsAutoRotating(false);
                }}
              >
                <div
                  className="gallery-placeholder"
                  style={{ background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)` }}
                >
                  <span>{item.title}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Навигация */}
        <div className="flex justify-center gap-3 mt-8">
          {galleryItems.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? 'bg-[#C9A96E] scale-125'
                  : 'bg-[#C9A96E]/30 hover:bg-[#C9A96E]/60'
              }`}
              onClick={() => {
                setActiveIndex(index);
                setIsAutoRotating(false);
              }}
            />
          ))}
        </div>

        {/* Подпись */}
        <p className="text-center text-sm text-[#6B6B6B] mt-6 font-body">
          Здесь будут ваши любимые фотографии
        </p>
      </div>
    </section>
  );
}
