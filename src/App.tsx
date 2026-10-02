/**
 * ═══════════════════════════════════════════════════════
 * СВАДЕБНЫЙ САЙТ — ГЛАВНЫЙ КОМПОНЕНТ
 * Андрей & Полина | 27.07.2027 | Рязань
 * ═══════════════════════════════════════════════════════
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Preloader from './components/Preloader';
import HeroSection from './components/HeroSection';
import TimelineSection from './components/TimelineSection';
import InvitationSection from './components/InvitationSection';
import DetailsSection from './components/DetailsSection';
import GallerySection from './components/GallerySection';
import RSVPSection from './components/RSVPSection';
import FooterSection from './components/FooterSection';
import CustomCursor from './components/CustomCursor';

// Регистрация GSAP плагинов
gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Обработка завершения загрузки
  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
    // Небольшая задержка для плавного перехода
    setTimeout(() => {
      setShowContent(true);
    }, 500);
  }, []);

  // GSAP ScrollTrigger — отслеживание прогресса скролла
  useEffect(() => {
    if (!showContent) return;

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', updateProgress, { passive: true });

    // Инициализация ScrollTrigger анимаций
    const ctx = gsap.context(() => {
      // Анимация появления секций
      gsap.utils.toArray<HTMLElement>('.section').forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'top 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Параллакс для фоновых элементов
      gsap.utils.toArray<HTMLElement>('.parallax-bg').forEach((el) => {
        const speed = parseFloat(el.dataset.speed || '0.5');
        gsap.to(el, {
          y: () => -window.scrollY * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      });

      // Анимация заголовков
      gsap.utils.toArray<HTMLElement>('.animate-title').forEach((title) => {
        gsap.fromTo(
          title,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: title,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Анимация карточек деталей
      gsap.utils.toArray<HTMLElement>('.detail-card').forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, rotateX: 10 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.8,
            delay: i * 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Анимация элементов таймлайна
      gsap.utils.toArray<HTMLElement>('.timeline-item').forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // Анимация программы дня
      gsap.utils.toArray<HTMLElement>('.program-item').forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: i * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [showContent]);

  // Скрытие начального загрузчика
  useEffect(() => {
    const loader = document.getElementById('initialLoader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 1000);
    }
  }, []);

  return (
    <div ref={mainRef} className="relative">
      {/* Кастомный курсор (только для десктопа) */}
      {!isMobile && <CustomCursor />}

      {/* Шумовой оверлей для кинематографичности */}
      <div className="noise-overlay" />
      
      {/* Виньетка */}
      <div className="vignette-overlay" />

      {/* Прелоадер */}
      {isLoading && <Preloader onComplete={handleLoadComplete} />}

      {/* Основной контент */}
      <main
        className={`transition-opacity duration-1000 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Hero секция */}
        <HeroSection isMobile={isMobile} />

        {/* Переход между секциями */}
        <div className="section-transition">
          <div className="transition-ring" />
          <div className="transition-ring" />
          <div className="transition-ring" />
          <div className="transition-ring" />
          <div className="transition-ring" />
        </div>

        {/* Наша история — Timeline */}
        <TimelineSection />

        {/* Переход */}
        <div className="section-transition">
          <div className="transition-ring" />
          <div className="transition-ring" />
          <div className="transition-ring" />
        </div>

        {/* Приглашение */}
        <InvitationSection />

        {/* Переход */}
        <div className="section-transition">
          <div className="transition-ring" />
          <div className="transition-ring" />
          <div className="transition-ring" />
          <div className="transition-ring" />
        </div>

        {/* Детали свадьбы */}
        <DetailsSection />

        {/* Переход */}
        <div className="section-transition">
          <div className="transition-ring" />
          <div className="transition-ring" />
          <div className="transition-ring" />
        </div>

        {/* Галерея */}
        <GallerySection />

        {/* Переход */}
        <div className="section-transition">
          <div className="transition-ring" />
          <div className="transition-ring" />
          <div className="transition-ring" />
          <div className="transition-ring" />
        </div>

        {/* RSVP */}
        <RSVPSection />

        {/* Футер */}
        <FooterSection scrollProgress={scrollProgress} />
      </main>

      {/* Прогресс-бар скролла */}
      {showContent && (
        <div className="fixed top-0 left-0 w-full h-[2px] z-[9997] pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-[#C9A96E] via-[#D4AF37] to-[#D4A0A0] transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
