import React, { useEffect, useRef, useState } from 'react';

interface ShutterRevealImageProps {
  src: string;
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
  alt = '',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  delay = 0,
  duration = 1.1,
  fetchPriority,
  loading = 'lazy',
  decoding = 'async',
  onClick,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Normalize delay to milliseconds
  const delayMs = delay < 10 ? delay * 1000 : delay;
  const durationMs = duration < 10 ? duration * 1000 : duration;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Immediate check if element is already in viewport
    const checkViewport = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      // Trigger if top of element is inside screen (with 40px margin)
      if (rect.top <= windowHeight - 30 && rect.bottom >= 0) {
        setIsVisible(true);
        return true;
      }
      return false;
    };

    if (checkViewport()) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: [0, 0.05, 0.15],
        rootMargin: '0px 0px -20px 0px',
      }
    );

    observer.observe(el);

    // Fallback scroll listener in case smooth-scroll (Lenis) delays IntersectionObserver events
    const onScroll = () => {
      if (checkViewport()) {
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      style={{
        clipPath: isVisible ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
        WebkitClipPath: isVisible ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
        opacity: isVisible ? 1 : 0.2,
        transitionProperty: 'clip-path, -webkit-clip-path, opacity',
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
        transitionDelay: `${delayMs}ms`,
        willChange: 'clip-path, -webkit-clip-path, opacity',
      }}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(6%) scale(1.08)',
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
  duration = 1.1,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const delayMs = delay < 10 ? delay * 1000 : delay;
  const durationMs = duration < 10 ? duration * 1000 : duration;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkViewport = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top <= windowHeight - 30 && rect.bottom >= 0) {
        setIsVisible(true);
        return true;
      }
      return false;
    };

    if (checkViewport()) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: [0, 0.05, 0.15],
        rootMargin: '0px 0px -20px 0px',
      }
    );

    observer.observe(el);

    const onScroll = () => {
      if (checkViewport()) {
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      style={{
        clipPath: isVisible ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
        WebkitClipPath: isVisible ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)',
        opacity: isVisible ? 1 : 0.2,
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
