'use client';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
export const ToastProvider = () => {
  const { toasts, removeToast } = useStore();
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border
              ${toast.type === 'success' ? 'bg-poker-accent/20 border-poker-accent text-white' : 
                toast.type === 'error' ? 'bg-red-500/20 border-red-500 text-white' : 
                'bg-poker-panel border-white/10 text-white'}
            `}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}