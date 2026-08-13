import React from 'react';
import { motion, Variants } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  el?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  wordStagger?: number;
  highlightWords?: string[];
  highlightClass?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  el: Tag = 'h2',
  className = '',
  delay = 0,
  wordStagger = 0.06,
  highlightWords = [],
  highlightClass = 'text-brand-green font-black'
}) => {
  const words = text.split(' ');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: wordStagger,
        delayChildren: delay
      }
    }
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 16,
      filter: 'blur(3px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className={`inline-block ${className}`}
      style={{ willChange: 'transform, opacity' }}
    >
      <Tag className={className}>
        {words.map((word, i) => {
          const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
          const isHighlighted = highlightWords.some(
            (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
          );

          return (
            <motion.span
              key={i}
              variants={wordVariants}
              className={`inline-block mr-[0.25em] ${isHighlighted ? highlightClass : ''}`}
            >
              {word}
            </motion.span>
          );
        })}
      </Tag>
    </motion.div>
  );
};
