import React, { useEffect, useRef, useState } from 'react';

interface ShutterRevealImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  delay?: number; // In milliseconds or seconds (auto-normalized)
  duration?: number; // In seconds (default: 1.1s)
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  onClick?: () => void;
  children?: React.ReactNode;
}

/**
 * ShutterRevealImage
 * Center-out vertical shutter/aperture reveal animation on scroll into view.
 * Matching the exact interaction from yeqq.com.tr/about-me.
 */
export const ShutterRevealImage: React.FC<ShutterRevealImageProps> = ({
  src,
  srcSet,
  sizes,
  alt = '',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  delay = 0,
  duration = 0.9,
  fetchPriority,
  loading = 'lazy',
  decoding = 'async',
  onClick,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Hero / priority images should be visible immediately for zero-lag LCP
  const [isVisible, setIsVisible] = useState<boolean>(fetchPriority === 'high');

  // Normalize delay to milliseconds
  const delayMs = delay < 10 ? delay * 1000 : delay;
  const durationMs = duration < 10 ? duration * 1000 : duration;

  useEffect(() => {
    if (isVisible) return;
    const el = containerRef.current;
    if (!el) {
      setIsVisible(true);
      return;
    }

    // 1. Immediate viewport check
    try {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      if (rect.top <= vh + 150 && rect.bottom >= -150) {
        setIsVisible(true);
        return;
      }
    } catch {
      setIsVisible(true);
      return;
    }

    // 2. IntersectionObserver with generous rootMargin
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0,
        rootMargin: '200px 0px 200px 0px',
      }
    );

    observer.observe(el);

    // 3. Failsafe: Never keep an image hidden for more than 350ms
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 350);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      style={{
        clipPath: isVisible ? 'none' : 'inset(35% 0% 35% 0%)',
        WebkitClipPath: isVisible ? 'none' : 'inset(35% 0% 35% 0%)',
        opacity: isVisible ? 1 : 0.7,
        transitionProperty: 'clip-path, -webkit-clip-path, opacity',
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
        transitionDelay: `${delayMs}ms`,
        willChange: 'clip-path, -webkit-clip-path, opacity',
      }}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(4%) scale(1.05)',
          transitionProperty: 'transform',
          transitionDuration: `${durationMs * 1.15}ms`,
          transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
          transitionDelay: `${delayMs}ms`,
          willChange: 'transform',
        }}
        className={imgClassName}
      />
      {children}
    </div>
  );
};

interface ShutterRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  onClick?: () => void;
}

export const ShutterReveal: React.FC<ShutterRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.9,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const delayMs = delay < 10 ? delay * 1000 : delay;
  const durationMs = duration < 10 ? duration * 1000 : duration;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      setIsVisible(true);
      return;
    }

    // 1. Immediate viewport check
    try {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      if (rect.top <= vh + 150 && rect.bottom >= -150) {
        setIsVisible(true);
        return;
      }
    } catch {
      setIsVisible(true);
      return;
    }

    // 2. IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setIsVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0,
        rootMargin: '200px 0px 200px 0px',
      }
    );

    observer.observe(el);

    // 3. Failsafe timer
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 350);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      style={{
        clipPath: isVisible ? 'none' : 'inset(35% 0% 35% 0%)',
        WebkitClipPath: isVisible ? 'none' : 'inset(35% 0% 35% 0%)',
        opacity: isVisible ? 1 : 0.7,
        transitionProperty: 'clip-path, -webkit-clip-path, opacity',
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
        transitionDelay: `${delayMs}ms`,
        willChange: 'clip-path, -webkit-clip-path, opacity',
      }}
    >
      {children}
    </div>
  );
};
