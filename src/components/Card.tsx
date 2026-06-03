'use client';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useStore } from '@/store/useStore';
export interface CardData {
  value: number;
  suit: string;
}
export const Card = ({ value, hidden = false, className }: { value?: string | CardData, hidden?: boolean, className?: string }) => {
  const { profile } = useStore();
  const cardBack = profile?.settings?.cardBack || 'blue';
  const cardFront = profile?.settings?.cardFront || 'classic';

  const getCardString = (val?: string | CardData): string | undefined => {
    if (!val) return undefined;
    if (typeof val === 'string') return val;
    if (val.value === -1 || val.suit === 'empty') return undefined; 
    let rank = val.value.toString();
    if (val.value === 10) rank = 'T';
    if (val.value === 11) rank = 'J';
    if (val.value === 12) rank = 'Q';
    if (val.value === 13) rank = 'K';
    if (val.value === 14) rank = 'A';
    let s = 's';
    if (val.suit === 'Hearts') s = 'h';
    if (val.suit === 'Diamonds') s = 'd';
    if (val.suit === 'Clubs') s = 'c';
    if (val.suit === 'Spades') s = 's';
    return rank + s;
  };
  const cardStr = getCardString(value);
  const isActuallyHidden = hidden || (!cardStr && typeof value === 'object');
  const getCardBackStyle = () => {
    switch(cardBack) {
      case 'red': return 'bg-gradient-to-br from-red-800 to-red-950 border-white/20';
      case 'gold': return 'bg-gradient-to-br from-yellow-700 to-yellow-900 border-yellow-500/50';
      case 'minimal': return 'bg-zinc-800 border-zinc-600';
      case 'blue':
      default: return 'bg-gradient-to-br from-blue-800 to-blue-950 border-white/20';
    }
  };
  const getCardFrontStyle = () => {
    switch (cardFront) {
      case 'dark': return 'bg-zinc-800 border-zinc-700 text-zinc-200';
      case 'vintage': return 'bg-[#f4ebd8] border-[#d4c5b0]';
      case 'classic':
      case 'four-color':
      default: return 'bg-white border-gray-200';
    }
  };
  const getSuitColor = (suit: string) => {
    if (cardFront === 'four-color') {
      switch(suit) {
        case 'h': return 'text-red-500';
        case 'd': return 'text-blue-500';
        case 'c': return 'text-green-600';
        case 's': return 'text-black';
        default: return 'text-black';
      }
    }
    if (cardFront === 'dark') {
      switch(suit) {
        case 'h': 
        case 'd': return 'text-red-400';
        case 'c': 
        case 's': return 'text-gray-200';
        default: return 'text-gray-200';
      }
    }
    switch(suit) {
      case 'h': 
      case 'd': return cardFront === 'vintage' ? 'text-red-800' : 'text-red-500';
      case 'c': 
      case 's': return cardFront === 'vintage' ? 'text-[#2a1808]' : 'text-black';
      default: return 'text-black';
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, rotateY: 180 }}
      animate={{ opacity: 1, y: 0, rotateY: isActuallyHidden ? 180 : 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      whileHover={{ y: -10 }}
      className={clsx(
        "w-12 h-16 sm:w-16 sm:h-24 rounded shadow-[0_4px_15px_rgba(0,0,0,0.3)] border flex items-center justify-center text-lg sm:text-2xl font-bold select-none cursor-pointer",
        isActuallyHidden ? getCardBackStyle() : getCardFrontStyle(),
        !isActuallyHidden && cardStr ? getSuitColor(cardStr[1]) : "",
        className
      )}
    >
      {!isActuallyHidden && cardStr && (
        <div className="flex flex-col items-center">
          <span>{cardStr[0] === 'T' ? '10' : cardStr[0].toUpperCase()}</span>
          <span className="text-sm sm:text-lg">
            {cardStr[1] === 'h' ? '♥' : cardStr[1] === 'd' ? '♦' : cardStr[1] === 'c' ? '♣' : '♠'}
          </span>
        </div>
      )}
      {isActuallyHidden && (
        <div className="w-full h-full opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#fff_2px,#fff_4px)] rounded-sm"></div>
      )}
    </motion.div>
  );
}