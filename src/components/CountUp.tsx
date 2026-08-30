import React, { useEffect, useState, useRef } from 'react';
import { useInView, animate } from 'framer-motion';

export type CountAnimationType = 'counter' | 'odometer' | 'scramble' | 'pulse';

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  type?: CountAnimationType;
  separator?: string;
  decimals?: number;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  prefix = '',
  suffix = '',
  duration = 2.2,
  className = '',
  type = 'counter',
  separator = '.',
  decimals = 0,
}) => {
  const [displayValue, setDisplayValue] = useState<string | number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });

  const formatNumber = (num: number) => {
    if (decimals > 0) {
      const parts = num.toFixed(decimals).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return parts.join(',');
    }
    return Math.floor(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  useEffect(() => {
    if (!isInView) return;

    if (type === 'scramble') {
      // Tech / Cyber Scramble Effect
      const targetStr = end.toString();
      const chars = '0123456789%#@*+=';
      let iteration = 0;
      const totalIterations = Math.max(15, Math.floor(duration * 20));

      const interval = setInterval(() => {
        const currentScramble = targetStr
          .split('')
          .map((_, index) => {
            if (index < (iteration / totalIterations) * targetStr.length) {
              return targetStr[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        setDisplayValue(currentScramble);
        iteration += 1;

        if (iteration >= totalIterations) {
          clearInterval(interval);
          setDisplayValue(formatNumber(end));
          setIsCompleted(true);
        }
      }, 40);

      return () => clearInterval(interval);
    }

    // Default & Eased Counter with Cubic Bezier
    const controls = animate(0, end, {
      duration,
      ease: [0.16, 1, 0.3, 1], // Smooth premium deceleration
      onUpdate(value) {
        setDisplayValue(formatNumber(value));
      },
      onComplete() {
        setIsCompleted(true);
      },
    });

    return () => controls.stop();
  }, [isInView, end, duration, type, separator, decimals]);

  if (type === 'odometer' && isInView) {
    const formattedEnd = formatNumber(end);
    return (
      <span
        ref={ref}
        className={`inline-flex items-baseline font-mono-num select-none ${className} ${
          isCompleted ? 'animate-glow-pulse' : ''
        }`}
      >
        {prefix && <span className="mr-0.5">{prefix}</span>}
        <span className="inline-flex overflow-hidden h-[1.15em] leading-none">
          {formattedEnd.split('').map((char, idx) => {
            const isDigit = /\d/.test(char);
            if (!isDigit) {
              return (
                <span key={idx} className="inline-block px-0.5">
                  {char}
                </span>
              );
            }
            const digitNum = parseInt(char, 10);
            return (
              <span
                key={idx}
                className="inline-block relative w-[0.6em] h-[1.15em] overflow-hidden"
              >
                <span
                  className="absolute left-0 top-0 flex flex-col transition-transform duration-1000 ease-out"
                  style={{
                    transform: `translateY(-${digitNum * 10}%)`,
                    transitionDelay: `${idx * 80}ms`,
                  }}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                    <span
                      key={d}
                      className="h-[1.15em] flex items-center justify-center"
                    >
                      {d}
                    </span>
                  ))}
                </span>
              </span>
            );
          })}
        </span>
        {suffix && <span className="ml-0.5">{suffix}</span>}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={`inline-block font-mono-num transition-transform duration-300 ${className} ${
        isCompleted ? 'scale-100 animate-fade-in' : ''
      }`}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};
