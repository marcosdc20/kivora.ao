import React, { useState, useEffect } from 'react';

interface WordRotatorProps {
  words: string[];
  interval?: number;
  className?: string;
}

/**
 * WordRotator — Alternância suave e tipográfica de palavras-chave
 */
export const WordRotator: React.FC<WordRotatorProps> = ({
  words,
  interval = 3200,
  className = '',
}) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (words.length <= 1) return;

    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setFade(true);
      }, 250);
    }, interval);

    return () => clearInterval(timer);
  }, [words, interval]);

  return (
    <span
      className={`inline-block transition-all duration-300 transform ${
        fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${className}`}
    >
      {words[index]}
    </span>
  );
};
