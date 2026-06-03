'use client';
import { motion } from 'framer-motion';
export const Chip = ({ amount }: { amount: number }) => {
  return (
    <motion.div
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-4 border-dashed border-white/40 bg-poker-gold text-[10px] sm:text-xs font-bold text-black shadow-lg"
    >
      {amount}
    </motion.div>
  );
}