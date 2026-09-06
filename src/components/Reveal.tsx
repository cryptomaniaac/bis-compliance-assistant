'use client';

import React, { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number; // Delay in ms
  duration?: number; // Duration in ms (default 500ms)
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'; // Direction of translate
  distance?: number; // Distance in px (default 24px)
  threshold?: number; // Viewport visibility ratio to trigger (default 0.15)
  className?: string;
  style?: CSSProperties;
  instantOnMount?: boolean; // If true, triggers immediately on mount (for above-the-fold hero)
}

export default function Reveal({
  children,
  delay = 0,
  duration = 500,
  direction = 'up',
  distance = 24,
  threshold = 0.15,
  className = '',
  style = {},
  instantOnMount = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check OS reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (motionQuery.matches) {
        setPrefersReducedMotion(true);
        setIsVisible(true);
        return;
      }
    }

    if (instantOnMount) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node); // Trigger once
        }
      },
      { threshold }
    );

    observer.observe(node);

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [delay, instantOnMount, threshold]);

  // Compute initial transform based on direction
  const getInitialTransform = () => {
    if (prefersReducedMotion || direction === 'none') return 'translate3d(0,0,0)';
    switch (direction) {
      case 'up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'left':
        return `translate3d(${distance}px, 0, 0)`;
      case 'right':
        return `translate3d(-${distance}px, 0, 0)`;
      default:
        return `translate3d(0, ${distance}px, 0)`;
    }
  };

  const animatedStyle: CSSProperties = prefersReducedMotion
    ? style
    : {
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0,0,0)' : getInitialTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
        willChange: 'opacity, transform',
      };

  return (
    <div ref={ref} className={className} style={animatedStyle}>
      {children}
    </div>
  );
}
