'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { Card } from './Card';
import { useStore } from '@/store/useStore';
import clsx from 'clsx';
import { evaluateHand } from '@/lib/pokerEvaluator';
const HANDS = [
  { eng: 'Royal Flush', name: 'Флеш-рояль (Royal Flush)', desc: 'A, K, Q, J, 10 одной масти', example: ['As', 'Ks', 'Qs', 'Js', 'Ts'] },
  { eng: 'Straight Flush', name: 'Стрит-флеш (Straight Flush)', desc: 'Пять карт по порядку одной масти', example: ['9h', '8h', '7h', '6h', '5h'] },
  { eng: 'Four of a Kind', name: 'Каре (Four of a Kind)', desc: 'Четыре карты одного достоинства', example: ['Qs', 'Qh', 'Qd', 'Qc', '4s'] },
  { eng: 'Full House', name: 'Фулл-хаус (Full House)', desc: 'Три карты одного достоинства + пара', example: ['Js', 'Jh', 'Jd', '8c', '8s'] },
  { eng: 'Flush', name: 'Флеш (Flush)', desc: 'Пять карт одной масти не по порядку', example: ['Ac', 'Tc', '7c', '4c', '2c'] },
  { eng: 'Straight', name: 'Стрит (Straight)', desc: 'Пять карт по порядку разных мастей', example: ['5s', '4h', '3d', '2c', 'As'] },
  { eng: 'Three of a Kind', name: 'Сет / Тройка (Three of a Kind)', desc: 'Три карты одного достоинства', example: ['8s', '8h', '8d', 'Kc', '4s'] },
  { eng: 'Two Pair', name: 'Две пары (Two Pair)', desc: 'Две карты одного достоинства + две другого', example: ['Ts', 'Th', '7d', '7c', 'Ks'] },
  { eng: 'Pair', name: 'Пара (One Pair)', desc: 'Две карты одного достоинства', example: ['As', 'Ah', '9d', '5c', '2s'] },
  { eng: 'High Card', name: 'Старшая карта (High Card)', desc: 'Самая старшая карта из пяти', example: ['As', 'Jh', '8d', '5c', '2s'] },
];
export const PokerHandsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTable, profile } = useStore();

  let myCombo: string | null = null;
  if (currentTable && currentTable.status !== 'WAITING') {
    const myState = currentTable.playerStates?.[profile?.nickname || ''];
    if (myState && myState.cards) {

       const validCards = myState.cards.filter((c: any) => c && c.value !== -1 && c.suit !== 'empty');
       if (validCards.length > 0) {
         const tableCards = currentTable.tableDeck?.cards || currentTable.communityCards || [];
         myCombo = evaluateHand(myState.cards, tableCards);
       }
    }
  }
  return (
    <div className="relative pointer-events-auto">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-black/50 hover:bg-black/70 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-white backdrop-blur-md border border-white/10 transition-colors"
      >
        <HelpCircle size={18} />
        <span className="font-bold text-xs sm:text-sm hidden sm:inline">Комбинации</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full right-0 mt-2 w-72 sm:w-80 max-h-[70vh] overflow-y-auto bg-poker-panel/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-[100]"
          >
            <div className="sticky top-0 bg-black/40 backdrop-blur-md p-3 sm:p-4 border-b border-white/10 flex justify-between items-center z-10">
              <h3 className="font-bold text-white text-sm sm:text-base">Комбинации (от старшей)</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-2 sm:p-3 flex flex-col gap-1">
              {HANDS.map((hand, i) => {
                const isCurrentCombo = myCombo === hand.eng || (myCombo === 'One Pair' && hand.eng === 'Pair');
                return (
                  <div 
                    key={i} 
                    className={clsx(
                      "p-2 rounded-xl transition-all border",
                      isCurrentCombo 
                        ? "bg-poker-accent/20 border-poker-accent/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]" 
                        : "hover:bg-white/5 border-transparent hover:border-white/5"
                    )}
                  >
                    <div className={clsx("font-bold text-xs sm:text-sm flex items-center gap-2", isCurrentCombo ? "text-poker-accent" : "text-poker-gold")}>
                      {hand.name}
                      {isCurrentCombo && <span className="text-[10px] bg-poker-accent text-black px-1.5 py-0.5 rounded uppercase tracking-wider">Ваша</span>}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-300 mt-0.5">{hand.desc}</div>
                    <div className="flex gap-1 sm:gap-2 mt-2 pointer-events-none">
                      {hand.example.map((card, idx) => (
                        <Card 
                          key={idx} 
                          value={card} 
                          className="!w-8 !h-12 sm:!w-10 sm:!h-14 !text-sm sm:!text-base shadow-sm border-white/20" 
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};