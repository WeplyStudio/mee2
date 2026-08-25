import React, { useEffect, useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds
  distance?: number; // Slide-up distance in px
}

export const ScrollReveal: React.FC<Props> = ({
  children,
  className = '',
  delay = 0,
  distance = 36,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const safeDistance = typeof distance === 'number' && !Number.isNaN(distance) ? distance : 36;
  const safeDelay = typeof delay === 'number' && !Number.isNaN(delay) ? delay : 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once revealed, unobserve for performance
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : `translateY(${safeDistance}px)`,
        transitionDelay: `${safeDelay}ms`,
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
};
