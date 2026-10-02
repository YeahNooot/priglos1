/**
 * ═══════════════════════════════════════════════════════
 * СЕКЦИЯ «ПРИГЛАШЕНИЕ»
 * 3D-конверт, печатная машинка, вихрь лепестков
 * ═══════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createRenderer, createPetalSystem, createSparkleSystem, createSceneFog, handleResize } from '../utils/three-helpers';

export default function InvitationSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const invitationText = `Дорогие друзья и родные!\n\nС огромной радостью и трепетом в сердце мы приглашаем вас разделить с нами самый важный день нашей жизни.\n\n27 июля 2027 года мы скажем друг другу «Да» и начнём нашу совместную историю.\n\nВаше присутствие станет лучшим подарком для нас в этот волшебный день.`;

  // Эффект печатной машинки
  useEffect(() => {
    if (!isEnvelopeOpen) return;

    setIsTyping(true);
    setDisplayedText('');
    let index = 0;

    const typeInterval = setInterval(() => {
      if (index < invitationText.length) {
        setDisplayedText(invitationText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [isEnvelopeOpen]);

  // Three.js — вихрь лепестков
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    const renderer = createRenderer(canvas, container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    createSceneFog(scene, 0xFFF9F0, 5, 20);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0, 8);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xFFF9F0, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xC9A96E, 1.5, 15);
    pointLight.position.set(0, 3, 5);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xD4A0A0, 0.8, 12);
    pointLight2.position.set(-3, -2, 3);
    scene.add(pointLight2);

    // Лепестки в вихре
    const petals = createPetalSystem(300, 10);
    scene.add(petals);

    // Блёстки
    const sparkles = createSparkleSystem(150, 8);
    scene.add(sparkles);

    // 3D-колонны (low-poly декорации зала)
    const columnGeometry = new THREE.CylinderGeometry(0.15, 0.2, 4, 8);
    const columnMaterial = new THREE.MeshStandardMaterial({
      color: 0xF5F0EB,
      roughness: 0.7,
      metalness: 0.1,
      transparent: true,
      opacity: 0.3,
    });

    for (let i = 0; i < 6; i++) {
      const column = new THREE.Mesh(columnGeometry, columnMaterial);
      const angle = (i / 6) * Math.PI * 2;
      column.position.set(
        Math.cos(angle) * 6,
        0,
        Math.sin(angle) * 6 - 5
      );
      column.castShadow = true;
      scene.add(column);
    }

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

      // Вихревое движение лепестков
      const positions = petals.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const i3 = i * 3;
        const arr = positions.array as Float32Array;
        const angle = elapsed * 0.5 + i * 0.1;
        const radius = 2 + Math.sin(elapsed * 0.3 + i * 0.05) * 2;
        
        arr[i3] = Math.cos(angle + i * 0.02) * radius;
        arr[i3 + 1] += Math.sin(elapsed + i) * 0.005;
        arr[i3 + 2] = Math.sin(angle + i * 0.02) * radius - 3;

        // Wrap
        if (arr[i3 + 1] > 5) arr[i3 + 1] = -5;
        if (arr[i3 + 1] < -5) arr[i3 + 1] = 5;
      }
      positions.needsUpdate = true;

      // Мерцание блёсток
      const sparklePositions = sparkles.geometry.attributes.position;
      for (let i = 0; i < sparklePositions.count; i++) {
        const i3 = i * 3;
        const arr = sparklePositions.array as Float32Array;
        const angle = elapsed * 0.8 + i * 0.15;
        const r = 1 + Math.sin(elapsed + i * 0.2) * 1.5;
        arr[i3] = Math.cos(angle) * r;
        arr[i3 + 1] = Math.sin(elapsed * 0.5 + i * 0.3) * 2;
        arr[i3 + 2] = Math.sin(angle) * r - 2;
      }
      sparklePositions.needsUpdate = true;

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

  // Открытие конверта при скролле
  useEffect(() => {
    const handleScroll = () => {
      const section = containerRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const progress = 1 - rect.top / window.innerHeight;
      if (progress > 0.3 && !isEnvelopeOpen) {
        setIsEnvelopeOpen(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isEnvelopeOpen]);

  return (
    <section
      ref={containerRef}
      className="section invitation-section"
      id="invitation"
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
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] uppercase text-[#C9A96E] mb-4 font-body animate-title">
            С любовью приглашаем
          </p>
          <h2 className="text-4xl md:text-6xl font-display text-[#0D0D0D] animate-title">
            Приглашение
          </h2>
          <div className="gold-divider mt-6" />
        </div>

        {/* Конверт */}
        <div className="invitation-envelope mx-auto">
          <div className={`envelope-body ${isEnvelopeOpen ? 'animate-breathe-slow' : ''}`}>
            {/* Клапан конверта */}
            <div className={`envelope-flap ${isEnvelopeOpen ? 'open' : ''}`} />

            {/* Содержимое письма */}
            <div className="relative pt-8">
              {/* Имена */}
              <div className="invitation-names">
                Андрей & Полина
              </div>

              {/* Текст с эффектом печатной машинки */}
              <div className="invitation-text">
                {isEnvelopeOpen ? (
                  <div className="whitespace-pre-line">
                    {displayedText}
                    {isTyping && (
                      <span className="inline-block w-[2px] h-[1.2em] bg-[#C9A96E] ml-1 animate-pulse" />
                    )}
                  </div>
                ) : (
                  <p className="text-[#6B6B6B] italic">Нажмите или прокрутите, чтобы открыть...</p>
                )}
              </div>

              {/* Подпись */}
              {displayedText.length === invitationText.length && (
                <div className="mt-8 text-center" style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
                  <div className="gold-divider" />
                  <p className="font-script text-2xl text-[#C9A96E] mt-4">
                    С любовью, Андрей и Полина
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Кнопка для открытия конверта (мобильная) */}
        {!isEnvelopeOpen && (
          <div className="text-center mt-8">
            <button
              onClick={() => setIsEnvelopeOpen(true)}
              className="btn-outline magnetic-btn"
            >
              <span>Открыть письмо</span>
            </button>
          </div>
        )}
      </div>

      {/* CSS-лепестки вокруг конверта */}
      <div className="particles-container" style={{ zIndex: 2 }}>
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`inv-petal-${i}`}
            className="petal"
            style={{
              '--x': `${30 + Math.random() * 40}%`,
              '--duration': `${8 + Math.random() * 6}s`,
              '--delay': `${Math.random() * 4}s`,
              width: `${8 + Math.random() * 12}px`,
              height: `${12 + Math.random() * 16}px`,
              background: i % 2 === 0 ? '#D4A0A0' : '#E8D5A3',
              opacity: 0.3 + Math.random() * 0.3,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </section>
  );
}
