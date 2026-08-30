import React from 'react';
import { motion, Variants } from 'framer-motion';

export type TextAnimationMode = 'letter-stagger' | 'line-reveal' | 'word-slide' | 'typewriter';

interface AnimatedTextProps {
  text: string;
  el?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  delay?: number;
  mode?: TextAnimationMode;
  staggerDelay?: number;
  highlightWords?: string[];
  highlightClass?: string;
  once?: boolean;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  el: Tag = 'h2',
  className = '',
  delay = 0,
  mode = 'line-reveal',
  staggerDelay = 0.035,
  highlightWords = [],
  highlightClass = 'text-[#FF6500] font-black',
  once = true,
}) => {
  const lines = text.split('\n');

  // 1. Line-by-Line Reveal (Apple/Stripe typography mask reveal)
  if (mode === 'line-reveal' || mode === 'word-slide') {
    return (
      <Tag className={className}>
        {lines.map((line, lineIdx) => (
          <span key={lineIdx} className="block overflow-hidden">
            <motion.span
              initial={{ y: '100%', opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once, amount: 0.15 }}
              transition={{
                duration: 0.75,
                delay: delay + lineIdx * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="block"
            >
              {line}
            </motion.span>
          </span>
        ))}
      </Tag>
    );
  }

  // 2. Letter-by-Letter Stagger Animation (with strict line-boundary respect)
  if (mode === 'letter-stagger') {
    const containerVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
    };

    const letterVariants: Variants = {
      hidden: {
        opacity: 0,
        y: 10,
      },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    };

    return (
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.15 }}
        variants={containerVariants}
        className="inline"
      >
        <Tag className={className}>
          {lines.map((line, lineIdx) => {
            const words = line.split(' ');
            return (
              <span key={lineIdx} className={lines.length > 1 ? 'block' : 'inline'}>
                {words.map((word, wordIdx) => {
                  const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
                  const isHighlighted = highlightWords.some(
                    (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
                  );

                  return (
                    <span
                      key={wordIdx}
                      className={`inline-block whitespace-nowrap mr-[0.25em] ${
                        isHighlighted ? highlightClass : ''
                      }`}
                    >
                      {word.split('').map((char, charIdx) => (
                        <motion.span
                          key={charIdx}
                          variants={letterVariants}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </Tag>
      </motion.span>
    );
  }

  // 3. Fallback / Plain lines
  return (
    <Tag className={className}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className={lines.length > 1 ? 'block' : 'inline'}>
          {line}
        </span>
      ))}
    </Tag>
  );
};
