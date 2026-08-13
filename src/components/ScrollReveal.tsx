import React from 'react';
import { motion, Variants } from 'framer-motion';

export type RevealVariant = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'stagger';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
  staggerChildren?: number;
  once?: boolean;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 0.95,
  className = '',
  staggerChildren = 0.15,
  once = true
}) => {
  // Premium, slow-decelerating cubic-bezier curve for smooth motion (Apple/Stripe style)
  const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  const getVariants = (): Variants => {
    switch (variant) {
      case 'fade-up':
        return {
          hidden: { opacity: 0, y: 18 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration, delay, ease: smoothEase }
          }
        };
      case 'fade-down':
        return {
          hidden: { opacity: 0, y: -18 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration, delay, ease: smoothEase }
          }
        };
      case 'fade-left':
        return {
          hidden: { opacity: 0, x: 22 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, delay, ease: smoothEase }
          }
        };
      case 'fade-right':
        return {
          hidden: { opacity: 0, x: -22 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { duration, delay, ease: smoothEase }
          }
        };
      case 'zoom-in':
        return {
          hidden: { opacity: 0, scale: 0.96 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { duration, delay, ease: smoothEase }
          }
        };
      case 'stagger':
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren,
              delayChildren: delay
            }
          }
        };
      default:
        return {
          hidden: { opacity: 0, y: 18 },
          visible: { opacity: 1, y: 0, transition: { duration, delay, ease: smoothEase } }
        };
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.15 }}
      variants={getVariants()}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

// Item child for staggered lists with slow, relaxed transition
export const ScrollRevealItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div variants={itemVariants} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </motion.div>
  );
};
