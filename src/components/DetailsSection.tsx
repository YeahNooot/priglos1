/**
 * ═══════════════════════════════════════════════════════
 * СЕКЦИЯ «ДЕТАЛИ СВАДЬБЫ»
 * Таймер, дресс-код, программа дня, локация
 * ═══════════════════════════════════════════════════════
 */

import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { createRenderer, createSparkleSystem, handleResize } from '../utils/three-helpers';

// Компонент таймера обратного отсчёта
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const weddingDate = new Date('2027-07-27T15:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = weddingDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="countdown-container">
      <div className="countdown-item">
        <div className="countdown-drum">{pad(timeLeft.days)}</div>
        <span className="countdown-label">Дней</span>
      </div>
      <div className="countdown-item">
        <div className="countdown-drum">{pad(timeLeft.hours)}</div>
        <span className="countdown-label">Часов</span>
      </div>
      <div className="countdown-item">
        <div className="countdown-drum">{pad(timeLeft.minutes)}</div>
        <span className="countdown-label">Минут</span>
      </div>
      <div className="countdown-item">
        <div className="countdown-drum">{pad(timeLeft.seconds)}</div>
        <span className="countdown-label">Секунд</span>
      </div>
    </div>
  );
}

// Данные программы дня
const programData = [
  { time: '14:00', name: 'Сбор гостей', desc: 'Welcome-зона с напитками', icon: '🥂' },
  { time: '15:00', name: 'Церемония', desc: 'Выездная регистрация в саду', icon: '💒' },
  { time: '16:00', name: 'Фуршет', desc: 'Лёгкие закуски и шампанское', icon: '🍾' },
  { time: '17:00', name: 'Банкет', desc: 'Праздничный ужин', icon: '🍽️' },
  { time: '19:00', name: 'Первый танец', desc: 'Самый волнительный момент', icon: '💃' },
  { time: '20:00', name: 'Торт', desc: 'Сладкий момент вечера', icon: '🎂' },
  { time: '21:00', name: 'Вечеринка', desc: 'Танцы и веселье до утра', icon: '🎉' },
  { time: '23:00', name: 'Фейерверк', desc: 'Яркое завершение вечера', icon: '🎆' },
];

// Цветовая палитра дресс-кода
const dressCodeColors = [
  { color: '#FAFAF8', name: 'Белый' },
  { color: '#F5F0EB', name: 'Кремовый' },
  { color: '#E8D5A3', name: 'Шампань' },
  { color: '#C9A96E', name: 'Золотой' },
  { color: '#D4A0A0', name: 'Пыльная роза' },
  { color: '#B8C4B8', name: 'Шалфей' },
  { color: '#C4B8D4', name: 'Лавандовый' },
];

export default function DetailsSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());

  // Three.js — декоративные частицы
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
    camera.position.set(0, 0, 10);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xFFF9F0, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xC9A96E, 0.8, 15);
    pointLight.position.set(3, 3, 5);
    scene.add(pointLight);

    // Блёстки
    const sparkles = createSparkleSystem(200, 15);
    scene.add(sparkles);

    // Декоративные 3D-объекты (геометрические формы)
    const icoGeometry = new THREE.IcosahedronGeometry(0.5, 0);
    const icoMaterial = new THREE.MeshStandardMaterial({
      color: 0xC9A96E,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });

    const shapes: THREE.Mesh[] = [];
    for (let i = 0; i < 5; i++) {
      const shape = new THREE.Mesh(icoGeometry, icoMaterial.clone());
      shape.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        -3 - Math.random() * 5
      );
      shape.scale.setScalar(0.5 + Math.random() * 1.5);
      scene.add(shape);
      shapes.push(shape);
    }

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
        arr[i3] += Math.sin(elapsed * 0.3 + i * 0.2) * 0.003;
        arr[i3 + 1] += Math.cos(elapsed * 0.2 + i * 0.15) * 0.002;
      }
      positions.needsUpdate = true;

      // Вращение форм
      shapes.forEach((shape, i) => {
        shape.rotation.x += 0.005 * (i + 1);
        shape.rotation.y += 0.003 * (i + 1);
        shape.position.y += Math.sin(elapsed * 0.5 + i) * 0.002;
      });

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
      className="section details-section"
      id="details"
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
            Важная информация
          </p>
          <h2 className="text-4xl md:text-6xl font-display text-[#0D0D0D] animate-title">
            Детали свадьбы
          </h2>
          <div className="gold-divider mt-6" />
        </div>

        {/* Таймер обратного отсчёта */}
        <div className="mb-16 animate-title">
          <p className="text-center text-lg font-heading text-[#1A1A1A] mb-6">
            До нашего торжества осталось:
          </p>
          <CountdownTimer />
        </div>

        {/* Карточки деталей */}
        <div className="details-grid mb-16">
          {/* Дата и время */}
          <div className="detail-card">
            <div className="detail-icon">📅</div>
            <h3 className="detail-title">Дата и время</h3>
            <p className="detail-text">
              27 июля 2027 года<br />
              Начало в 15:00<br />
              <span className="text-[#C9A96E]">Сбор гостей с 14:00</span>
            </p>
          </div>

          {/* Место */}
          <div className="detail-card">
            <div className="detail-icon">📍</div>
            <h3 className="detail-title">Место проведения</h3>
            <p className="detail-text">
              г. Рязань<br />
              Усадьба «Золотой сад»<br />
              <span className="text-[#C9A96E]">ул. Садовая, 15</span>
            </p>
          </div>

          {/* Дресс-код */}
          <div className="detail-card">
            <div className="detail-icon">👗</div>
            <h3 className="detail-title">Дресс-код</h3>
            <p className="detail-text mb-4">
              Мы будем рады, если вы поддержите цветовую палитру нашего торжества:
            </p>
            <div className="color-palette">
              {dressCodeColors.map((item, i) => (
                <div
                  key={i}
                  className="color-swatch"
                  style={{ backgroundColor: item.color }}
                  title={item.name}
                />
              ))}
            </div>
          </div>

          {/* Транспорт */}
          <div className="detail-card">
            <div className="detail-icon">🚗</div>
            <h3 className="detail-title">Трансфер</h3>
            <p className="detail-text">
              Для гостей организован трансфер<br />
              от отеля до места проведения<br />
              <span className="text-[#C9A96E]">и обратно</span>
            </p>
          </div>

          {/* Подарки */}
          <div className="detail-card">
            <div className="detail-icon">🎁</div>
            <h3 className="detail-title">Подарки</h3>
            <p className="detail-text">
              Лучший подарок — ваше присутствие!<br />
              Но если вы хотите нас порадовать,<br />
              <span className="text-[#C9A96E]">мы будем рады конверту</span>
            </p>
          </div>

          {/* Контакты */}
          <div className="detail-card">
            <div className="detail-icon">📱</div>
            <h3 className="detail-title">Контакты</h3>
            <p className="detail-text">
              По всем вопросам обращайтесь:<br />
              <span className="text-[#C9A96E]">+7 (900) 123-45-67</span><br />
              wedding@andrey-polina.ru
            </p>
          </div>
        </div>

        {/* Программа дня */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-display text-center text-[#0D0D0D] mb-8 animate-title">
            Программа дня
          </h3>
          <div className="program-timeline">
            {programData.map((item, index) => (
              <div key={index} className="program-item">
                <div className="program-icon">{item.icon}</div>
                <div className="program-time">{item.time}</div>
                <div>
                  <div className="program-event-name">{item.name}</div>
                  <div className="program-event-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Блёстки CSS */}
      <div className="particles-container" style={{ zIndex: 2 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="sparkle-particle"
            style={{
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--duration': `${1.5 + Math.random() * 2}s`,
              '--delay': `${Math.random() * 3}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </section>
  );
}
