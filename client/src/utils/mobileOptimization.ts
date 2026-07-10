// Утилиты для мобильной оптимизации

// Проверка, является ли устройство мобильным
export const isMobile = (): boolean => {
  return window.innerWidth <= 768;
};

// Проверка, является ли устройство планшетом
export const isTablet = (): boolean => {
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

// Проверка, является ли устройство десктопом
export const isDesktop = (): boolean => {
  return window.innerWidth > 1024;
};

// Получение размера экрана
export const getScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
};

// Предотвращение зума на iOS при фокусе на input
export const preventZoomOnFocus = (): void => {
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
      }
    });
    
    input.addEventListener('blur', () => {
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    });
  });
};

// Оптимизация для touch устройств
export const optimizeForTouch = (): void => {
  // Увеличиваем размер touch targets
  const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
  touchTargets.forEach(target => {
    const element = target as HTMLElement;
    element.style.minHeight = '44px';
    element.style.minWidth = '44px';
  });
};

// Предотвращение горизонтального скролла
export const preventHorizontalScroll = (): void => {
  document.body.style.overflowX = 'hidden';
  document.documentElement.style.overflowX = 'hidden';
};

// Оптимизация производительности для мобильных устройств
export const optimizePerformance = (): void => {
  // Отключаем анимации на устройствах с низкой производительностью
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      document.body.classList.add('reduce-motion');
    }
  }
  
  // Отключаем hover эффекты на touch устройствах
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
  }
};

// Инициализация всех мобильных оптимизаций
export const initMobileOptimizations = (): void => {
  preventZoomOnFocus();
  optimizeForTouch();
  preventHorizontalScroll();
  optimizePerformance();
  
  // Обработчик изменения размера окна
  window.addEventListener('resize', () => {
    // Пересчитываем размеры при изменении ориентации
    setTimeout(() => {
      optimizeForTouch();
    }, 100);
  });
};

// Утилиты для адаптивных размеров
export const getResponsiveSize = (mobile: string, tablet: string, desktop: string): string => {
  const screenSize = getScreenSize();
  switch (screenSize) {
    case 'mobile':
      return mobile;
    case 'tablet':
      return tablet;
    case 'desktop':
      return desktop;
    default:
      return desktop;
  }
};

// Утилиты для адаптивных отступов
export const getResponsivePadding = (): string => {
  return getResponsiveSize('1rem', '1.5rem', '2rem');
};

// Утилиты для адаптивных размеров шрифтов
export const getResponsiveFontSize = (mobile: string, tablet: string, desktop: string): string => {
  return getResponsiveSize(mobile, tablet, desktop);
};

// Утилиты для адаптивных размеров кнопок
export const getResponsiveButtonSize = (): string => {
  return getResponsiveSize('48px', '52px', '56px');
};

// Утилиты для проверки поддержки функций
export const supportsTouch = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const supportsWebP = (): boolean => {
  const elem = document.createElement('canvas');
  return elem.getContext && elem.getContext('2d') 
    ? elem.toDataURL('image/webp').indexOf('data:image/webp') === 0 
    : false;
};

export const supportsIntersectionObserver = (): boolean => {
  return 'IntersectionObserver' in window;
};

// Утилиты для ленивой загрузки изображений
export const lazyLoadImages = (): void => {
  if (!supportsIntersectionObserver()) {
    // Fallback для старых браузеров
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.setAttribute('src', src);
        img.removeAttribute('data-src');
      }
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.getAttribute('data-src');
        if (src) {
          img.setAttribute('src', src);
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  });

  const images = document.querySelectorAll('img[data-src]');
  images.forEach(img => imageObserver.observe(img));
};

// Утилиты для оптимизации скролла
export const optimizeScroll = (): void => {
  // Добавляем плавный скролл
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Оптимизируем скролл для мобильных устройств
  if (isMobile()) {
    (document.body.style as any).webkitOverflowScrolling = 'touch';
  }
};

// Утилиты для оптимизации анимаций
export const optimizeAnimations = (): void => {
  // Проверяем предпочтения пользователя по поводу анимаций
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    document.body.classList.add('reduce-motion');
  }
  
  // Отключаем анимации на устройствах с низкой производительностью
  if ('hardwareConcurrency' in navigator && (navigator as any).hardwareConcurrency < 4) {
    document.body.classList.add('reduce-motion');
  }
};

export default {
  isMobile,
  isTablet,
  isDesktop,
  getScreenSize,
  preventZoomOnFocus,
  optimizeForTouch,
  preventHorizontalScroll,
  optimizePerformance,
  initMobileOptimizations,
  getResponsiveSize,
  getResponsivePadding,
  getResponsiveFontSize,
  getResponsiveButtonSize,
  supportsTouch,
  supportsWebP,
  supportsIntersectionObserver,
  lazyLoadImages,
  optimizeScroll,
  optimizeAnimations,
};
