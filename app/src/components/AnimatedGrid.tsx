import { memo } from 'react';
import { motion } from 'framer-motion';

const AnimatedGrid = memo(function AnimatedGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Grid Background */}
      <motion.div
        className="absolute inset-0 grid-bg opacity-50"
        animate={{ backgroundPosition: ['0px 0px', '50px 50px'] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />

      {/* Green Glow */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 255, 65, 0.05) 0%, transparent 70%)',
        }}
      />

      {/* Blue Glow */}
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.05) 0%, transparent 70%)',
        }}
      />
    </div>
  );
});

export default AnimatedGrid;
