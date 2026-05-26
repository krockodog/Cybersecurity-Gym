import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface FeedbackOverlayProps {
  type: 'success' | 'error' | 'warning' | null;
  message?: string;
  onDismiss?: () => void;
}

export function FeedbackOverlay({ type, message, onDismiss }: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            exit={{ y: -20 }}
            className={`flex flex-col items-center gap-3 p-8 rounded-2xl border backdrop-blur-sm ${
              type === 'success'
                ? 'bg-[rgba(0,255,65,0.15)] border-[#00ff41]'
                : type === 'error'
                  ? 'bg-[rgba(255,51,102,0.15)] border-[#ff3366]'
                  : 'bg-[rgba(255,170,0,0.15)] border-[#ffaa00]'
            }`}
          >
            {type === 'success' && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle size={48} className="text-[#00ff41]" />
              </motion.div>
            )}
            {type === 'error' && (
              <motion.div
                animate={{
                  x: [0, -10, 10, -10, 10, 0],
                }}
                transition={{ duration: 0.5 }}
              >
                <XCircle size={48} className="text-[#ff3366]" />
              </motion.div>
            )}
            {type === 'warning' && (
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <AlertTriangle size={48} className="text-[#ffaa00]" />
              </motion.div>
            )}
            {message && (
              <p
                className={`text-lg font-display font-bold ${
                  type === 'success'
                    ? 'text-[#00ff41]'
                    : type === 'error'
                      ? 'text-[#ff3366]'
                      : 'text-[#ffaa00]'
                }`}
              >
                {message}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
