export const easeExpoOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: easeExpoOut },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.3, ease: easeExpoOut },
};

export const shakeAnimation = {
  x: [0, -8, 8, -6, 6, -3, 3, 0],
  transition: { duration: 0.5 },
};

export const glowPulse = {
  boxShadow: [
    '0 0 5px rgba(0,255,65,0.3)',
    '0 0 20px rgba(0,255,65,0.6)',
    '0 0 5px rgba(0,255,65,0.3)',
  ],
  transition: { duration: 1.5, repeat: Infinity },
};

export const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.3, ease: easeExpoOut },
};
