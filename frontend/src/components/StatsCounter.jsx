import React, { useState, useEffect, useRef } from 'react';

export default function StatsCounter({ value, label, suffix = '', duration = 1500 }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) {
      setCount(value);
      return;
    }

    const totalSteps = 60;
    const stepTime = Math.max(Math.floor(duration / totalSteps), 16); // cap around 60fps
    const increment = Math.ceil(end / totalSteps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasStarted, value, duration]);

  return (
    <div
      ref={elementRef}
      className="flex flex-col items-center justify-center p-6 text-center border-r border-light-beige last:border-r-0 md:p-8 transition-transform duration-500 hover:scale-105"
    >
      <div className="font-serif text-3xl md:text-5xl font-bold text-primary-green mb-2 select-none tracking-tight">
        <span>{count.toLocaleString()}</span>
        <span className="text-sunrise-gold ml-1">{suffix}</span>
      </div>
      <div className="font-sans text-xs md:text-sm font-medium uppercase tracking-widest text-dark-text/70 mt-1">
        {label}
      </div>
    </div>
  );
}
