'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import clsx from 'clsx';
import { Minus, Plus } from 'lucide-react';
export const ActionPanel = () => {
  const { gameAction, currentTable, profile, playerBalances } = useStore();

  const minBet = currentTable?.minBet || (currentTable?.limit ? parseInt(currentTable.limit.replace('NL', '')) : 10) || 10;

  const callAmount = currentTable?.currentHighestBet || 0;

  const myState = currentTable?.playerStates?.[profile?.nickname || ''];
  const myBet = myState?.currentBet || 0;

  const myStack = myState?.balance ?? myState?.stack ?? myState?.chips ?? currentTable?.playerBalances?.[profile?.nickname || ''] ?? playerBalances[profile?.nickname || ''] ?? profile?.balance ?? 1000;

  const minRaise = callAmount > 0 ? callAmount + minBet : minBet;
  const [betSize, setBetSize] = useState(minRaise);

  useEffect(() => {
    setBetSize(prev => Math.min(Math.max(prev, minRaise), myStack));
  }, [minRaise, myStack]);

  const amountToCall = Math.max(0, callAmount - myBet);

  const isAllInCall = amountToCall >= myStack;
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-poker-panel/95 border-t border-white/10 p-3 pb-6 sm:p-4 rounded-t-2xl sm:rounded-2xl sm:border flex flex-col gap-3 sm:gap-4 w-full max-w-2xl mx-auto shadow-2xl backdrop-blur-md"
    >
      <div className="hidden sm:flex items-center gap-2 px-2">
        <span className="text-xs text-gray-400 font-medium w-12">Bet</span>
        <button 
          onClick={() => setBetSize(prev => Math.max(minRaise, prev - minBet))}
          disabled={isAllInCall || betSize <= minRaise}
          className="p-1 rounded bg-black/40 text-white/70 hover:bg-black/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={16} />
        </button>
        <input 
          type="range" 
          min={Math.min(minRaise, myStack)} 
          max={myStack}
          step={minBet}
          value={betSize}
          onChange={(e) => setBetSize(Number(e.target.value))}
          disabled={isAllInCall}
          className={clsx("flex-1 accent-poker-accent", isAllInCall && "opacity-50 cursor-not-allowed")}
        />
        <button 
          onClick={() => setBetSize(prev => Math.min(myStack, prev + minBet))}
          disabled={isAllInCall || betSize >= myStack}
          className="p-1 rounded bg-black/40 text-white/70 hover:bg-black/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
        </button>
        <input 
          type="number"
          min={Math.min(minRaise, myStack)}
          max={myStack}
          value={betSize === 0 ? '' : betSize}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) : 0;
            setBetSize(val);
          }}
          onBlur={() => {
            const minAllowed = Math.min(minRaise, myStack);
            if (betSize < minAllowed) setBetSize(minAllowed);
            if (betSize > myStack) setBetSize(myStack);
          }}
          disabled={isAllInCall}
          className="w-20 bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-poker-gold font-bold text-center outline-none focus:border-poker-gold disabled:opacity-50"
        />
        <button 
          onClick={() => setBetSize(myStack)}
          disabled={isAllInCall}
          className={clsx(
            "text-[10px] px-2 py-1 rounded font-bold transition-colors ml-1",
            isAllInCall ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-poker-accent/20 text-poker-accent hover:bg-poker-accent hover:text-black"
          )}
        >
          ALL IN
        </button>
      </div>
      <div className="flex justify-between gap-2">
        <button onClick={() => gameAction('fold')} className="flex-1 py-2 sm:py-3 bg-poker-danger/20 hover:bg-poker-danger/40 border border-poker-danger/50 text-white text-sm sm:text-base font-bold rounded-lg transition-colors">
          Fold
        </button>
        {amountToCall === 0 && !isAllInCall && (
          <button onClick={() => gameAction('check')} className="flex-1 py-2 sm:py-3 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/50 text-white text-sm sm:text-base font-bold rounded-lg transition-colors">
            Check
          </button>
        )}
        {amountToCall > 0 && !isAllInCall && (
          <button onClick={() => gameAction('call')} className="flex-1 py-2 sm:py-3 bg-gray-500/20 hover:bg-gray-500/40 border border-gray-500/50 text-white text-sm sm:text-base font-bold rounded-lg transition-colors">
            Call {amountToCall}
          </button>
        )}
        {isAllInCall && (
          <button onClick={() => gameAction('call')} className="flex-1 py-2 sm:py-3 bg-poker-accent/20 hover:bg-poker-accent/40 border border-poker-accent/50 text-poker-gold text-sm sm:text-base font-black rounded-lg transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            ALL IN {myStack}
          </button>
        )}
        <button 
          onClick={() => gameAction('raise', betSize)} 
          disabled={isAllInCall}
          className={clsx(
            "flex-1 py-2 sm:py-3 text-sm sm:text-base font-bold rounded-lg transition-colors",
            isAllInCall ? "bg-gray-800 border border-gray-700 text-gray-500 cursor-not-allowed opacity-50" : "bg-poker-accent hover:bg-poker-accent/80 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]"
          )}
        >
          Raise
        </button>
      </div>
    </motion.div>
  );
}