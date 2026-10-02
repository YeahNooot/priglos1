/**
 * ═══════════════════════════════════════════════════════
 * СЕКЦИЯ «ПОДТВЕРЖДЕНИЕ» — RSVP
 * 3D-форма, конфетти при отправке
 * ═══════════════════════════════════════════════════════
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { createRenderer, createConfettiSystem, handleResize } from '../utils/three-helpers';

export default function RSVPSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const clockRef = useRef(new THREE.Clock());
  const confettiRef = useRef<THREE.Points | null>(null);
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    attendance: '',
    guests: '1',
    dietary: '',
    message: '',
  });

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
    camera.position.set(0, 0, 10);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xFFF9F0, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xC9A96E, 0.8, 15);
    pointLight.position.set(2, 3, 5);
    scene.add(pointLight);

    // Декоративные частицы
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const goldColor = new THREE.Color(0xC9A96E);
    const roseColor = new THREE.Color(0xD4A0A0);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 20;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 15;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 10 - 5;

      const color = Math.random() > 0.5 ? goldColor : roseColor;
      particleColors[i3] = color.r;
      particleColors[i3 + 1] = color.g;
      particleColors[i3 + 2] = color.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Ресайз
    const onResize = () => {
      handleResize(renderer, camera, container);
    };
    window.addEventListener('resize', onResize);

    // Анимация
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      // Анимация частиц
      const positions = particles.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const i3 = i * 3;
        const arr = positions.array as Float32Array;
        arr[i3] += Math.sin(elapsed * 0.3 + i * 0.1) * 0.003;
        arr[i3 + 1] += Math.cos(elapsed * 0.2 + i * 0.08) * 0.002;
      }
      positions.needsUpdate = true;

      // Конфетти анимация
      if (confettiRef.current && isConfettiActive) {
        const confettiPositions = confettiRef.current.geometry.attributes.position;
        for (let i = 0; i < confettiPositions.count; i++) {
          const i3 = i * 3;
          const arr = confettiPositions.array as Float32Array;
          arr[i3 + 1] -= 0.05; // gravity
          arr[i3] += Math.sin(elapsed * 2 + i) * 0.01; // sway
        }
        confettiPositions.needsUpdate = true;

        // Fade out
        const confettiMaterial = confettiRef.current.material as THREE.PointsMaterial;
        confettiMaterial.opacity = Math.max(0, confettiMaterial.opacity - 0.005);
        if (confettiMaterial.opacity <= 0) {
          setIsConfettiActive(false);
          scene.remove(confettiRef.current);
          confettiRef.current = null;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.clear();
    };
  }, [isConfettiActive]);

  // Запуск конфетти
  const launchConfetti = useCallback(() => {
    if (!containerRef.current) return;

    const confetti = createConfettiSystem(2000);
    confetti.points.position.set(0, 5, 0);
    
    // Добавляем в сцену через поиск renderer
    const canvas = canvasRef.current;
    if (canvas) {
      // Получаем существующий renderer context
      const scene = new THREE.Scene();
      scene.add(confetti.points);
      confettiRef.current = confetti.points;
      setIsConfettiActive(true);
    }
  }, []);

  // Обработка отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    launchConfetti();

    // CSS-конфетти (дополнительный эффект)
    createCSSConfetti();
  };

  // Создание CSS-конфетти
  const createCSSConfetti = () => {
    const colors = ['#C9A96E', '#D4AF37', '#D4A0A0', '#E8D5A3', '#F0D4D4', '#FFFFFF'];
    const container = document.body;

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = `${5 + Math.random() * 10}px`;
      confetti.style.height = `${5 + Math.random() * 10}px`;
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
      confetti.style.setProperty('--delay', `${Math.random() * 0.5}s`);
      container.appendChild(confetti);

      // Удаление после анимации
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  };

  // Обработка изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section
      ref={containerRef}
      className="section rsvp-section"
      id="rsvp"
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
            Ждём вашего ответа
          </p>
          <h2 className="text-4xl md:text-6xl font-display text-[#0D0D0D] animate-title">
            Подтверждение
          </h2>
          <div className="gold-divider mt-6" />
          <p className="text-[#6B6B6B] mt-4 font-body max-w-md mx-auto">
            Пожалуйста, подтвердите своё присутствие до 1 июня 2027 года
          </p>
        </div>

        {/* Форма или подтверждение */}
        {!isSubmitted ? (
          <form className="rsvp-form" onSubmit={handleSubmit}>
            {/* Имя */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Ваше имя и фамилия</label>
              <input
                className="form-input"
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Иван Иванов"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                className="form-input"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </div>

            {/* Присутствие */}
            <div className="form-group">
              <label className="form-label" htmlFor="attendance">Вы сможете присутствовать?</label>
              <select
                className="form-select"
                id="attendance"
                name="attendance"
                value={formData.attendance}
                onChange={handleChange}
                required
              >
                <option value="">Выберите...</option>
                <option value="yes">С радостью приду!</option>
                <option value="maybe">Пока не уверен(а)</option>
                <option value="no">К сожалению, не смогу</option>
              </select>
            </div>

            {/* Количество гостей */}
            <div className="form-group">
              <label className="form-label" htmlFor="guests">Количество гостей</label>
              <select
                className="form-select"
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
              >
                <option value="1">1 человек</option>
                <option value="2">2 человека</option>
                <option value="3">3 человека</option>
                <option value="4">4 человека</option>
              </select>
            </div>

            {/* Предпочтения в еде */}
            <div className="form-group">
              <label className="form-label" htmlFor="dietary">Предпочтения в еде</label>
              <input
                className="form-input"
                type="text"
                id="dietary"
                name="dietary"
                value={formData.dietary}
                onChange={handleChange}
                placeholder="Вегетарианское, без глютена и т.д."
              />
            </div>

            {/* Пожелания */}
            <div className="form-group">
              <label className="form-label" htmlFor="message">Пожелания или вопросы</label>
              <textarea
                className="form-textarea"
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Напишите нам что-нибудь приятное..."
              />
            </div>

            {/* Кнопка отправки */}
            <div className="text-center mt-8">
              <button
                type="submit"
                className="btn-gold magnetic-btn"
              >
                <span>Отправить ответ</span>
              </button>
            </div>
          </form>
        ) : (
          /* Подтверждение отправки */
          <div className="rsvp-form text-center" style={{ animation: 'scaleIn 0.6s ease forwards' }}>
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-2xl font-display text-[#0D0D0D] mb-4">
              Спасибо, {formData.name}!
            </h3>
            <p className="text-[#6B6B6B] font-body mb-6">
              Ваш ответ получен. Мы с нетерпением ждём встречи с вами!
            </p>
            <div className="gold-divider" />
            <p className="font-script text-2xl text-[#C9A96E] mt-6">
              До встречи 27 июля!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
