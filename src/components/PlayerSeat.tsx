'use client';
import { useEffect, useRef, useState } from 'react';
import { MockPlayer } from '@/lib/mockGameState';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Chip } from './Chip';
import { Plus, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card } from './Card';
export const PlayerSeat = ({ 
  player, 
  positionClass, 
  index 
}: { 
  player: MockPlayer | any, 
  positionClass: string,
  index: number
}) => {
  const { takeSeat, mySeatIndex, currentTable } = useStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<SVGRectElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);
  useEffect(() => {
    if (player?.status !== 'thinking' || !currentTable?.turnStartTime) {
      setTimeLeft(null);
      return;
    }
    const turnStartTime = currentTable.turnStartTime;
    const TURN_LIMIT_MS = currentTable.turnTimeLimit || 30000;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - turnStartTime;
      const remainingMs = Math.max(0, TURN_LIMIT_MS - elapsed);
      setTimeLeft(Math.ceil(remainingMs / 1000));
      if (timerRef.current) {
        const dasharray = 100;
        const offset = dasharray - (dasharray * (remainingMs / TURN_LIMIT_MS));
        timerRef.current.style.strokeDashoffset = `${offset}`;
      }
    }, 100);
    return () => clearInterval(interval);
  }, [player?.status, currentTable?.turnStartTime]);
  if (!player) {
    if (currentTable?.status !== 'WAITING') {
      return <div className={clsx("absolute", positionClass)} />;
    }
    return (
      <div className={clsx("absolute flex flex-col items-center gap-2", positionClass)}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => takeSeat(index)}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-white/20 hover:border-poker-gold bg-black/20 flex flex-col items-center justify-center text-white/50 hover:text-poker-gold transition-colors group shadow-lg"
        >
          <Plus size={24} className="group-hover:scale-125 transition-transform" />
          <span className="text-[10px] font-bold uppercase mt-1">Сесть</span>
        </motion.button>
      </div>
    );
  }
  const isMe = mySeatIndex === index;
  const isWinner = currentTable?.status === 'FINISHED' && currentTable.winner && (
    Array.isArray(currentTable.winner) 
      ? currentTable.winner.includes(player.name)
      : currentTable.winner === player.name
  );
  return (
    <div className={clsx("absolute flex flex-col items-center gap-2", positionClass, isWinner || showProfile ? "z-50" : "z-10")}>
      <motion.div 
        animate={
          isWinner ? { scale: [1, 1.1, 1], boxShadow: ["0 0 0px rgba(234,179,8,0)", "0 0 20px rgba(234,179,8,0.8)", "0 0 0px rgba(234,179,8,0)"] } :
          player.status === 'thinking' ? { scale: [1, 1.05, 1] } : 
          isMe ? { scale: [0.8, 1.05, 1], transition: { duration: 0.3 } } : {}
        }
        transition={{ repeat: isWinner || player.status === 'thinking' ? Infinity : 0, duration: 1.5 }}
        className={clsx(
          "relative flex flex-col items-center p-2 rounded-xl border-2 bg-poker-panel/90 min-w-[80px] sm:min-w-[100px] shadow-xl transition-colors",
          isWinner ? "border-poker-gold" :
          player.status === 'ready' ? "border-green-500" :
          player.status === 'thinking' ? "border-transparent" : 
          isMe ? "border-blue-500" : "border-white/10",
          player.status === 'folded' && "opacity-50"
        )}
      >
        {isWinner && (
          <div className="absolute -top-14 sm:-top-16 whitespace-nowrap bg-black/80 px-3 py-1.5 rounded-xl border border-poker-gold/50 shadow-[0_0_15px_rgba(234,179,8,0.4)] z-50 animate-bounce flex flex-col items-center">
            <span className="text-poker-gold font-black text-xs sm:text-sm leading-tight">
              +{currentTable.winAmount || currentTable.prize || currentTable.pot || 0}
            </span>
            {currentTable.winningCombination && (
              <span className="text-[9px] sm:text-[11px] text-white/80 font-bold tracking-wider leading-tight">
                {currentTable.winningCombination}
              </span>
            )}
          </div>
        )}
        <div className="absolute -top-3 -right-3 z-20">
          {(currentTable?.status === 'WAITING' || currentTable?.status === 'FINISHED') && player.status === 'ready' ? (
            <div className="bg-green-500 rounded-full p-0.5 shadow-lg">
              <CheckCircle2 size={16} className="text-black" />
            </div>
          ) : (currentTable?.status === 'WAITING' || currentTable?.status === 'FINISHED') && player.status === 'not_ready' ? (
            <div className="bg-gray-500 rounded-full p-0.5 shadow-lg">
              <Clock size={16} className="text-black" />
            </div>
          ) : null}
        </div>
        <div className="relative" ref={popupRef}>
          <div 
            onClick={() => player.profile && setShowProfile(!showProfile)}
            className={clsx("cursor-pointer relative", player.profile && "hover:opacity-80 transition-opacity")}
          >
            {player.avatar ? (
              <img 
                src={player.avatar.startsWith('data:') ? player.avatar : `data:image/jpeg;base64,${player.avatar}`} 
                alt={player.name} 
                className={clsx("w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-1 border-2 object-cover transition-colors", showProfile ? 'border-poker-accent' : 'border-white/20')} 
              />
            ) : (
              <div className={clsx("w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-1 border-2 transition-colors", showProfile ? 'border-poker-accent' : 'border-white/20', player.avatarColor)} />
            )}
          </div>
          <AnimatePresence>
            {showProfile && player.profile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.15 }}
                className={clsx(
                  "absolute z-[100] w-48 sm:w-56 bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl flex flex-col gap-2 cursor-default pointer-events-auto",
                  index === 0 || index === 5 || index === 4 ? "bottom-full mb-2 left-1/2 -translate-x-1/2" : "top-full mt-2 left-1/2 -translate-x-1/2"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-sm font-bold text-white mb-1 flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="truncate">{player.name}</span>
                  {player.profile.role === 'ADMIN' && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold ml-2">ADMIN</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Сыграно игр:</span>
                    <span className="text-white font-bold">{player.profile.gamesPlayed || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Побед:</span>
                    <span className="text-white font-bold">{player.profile.wins || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Макс. выигрыш:</span>
                    <span className="text-poker-gold font-bold">{player.profile.bestWin || 0}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className="text-[10px] sm:text-xs font-semibold text-white truncate max-w-[80px]">{player.name}</span>
        <span className="text-[10px] sm:text-xs text-poker-gold font-bold">
          {currentTable?.playerBalances?.[player.name] ?? player.stack}
        </span>
        {}
        {!isMe && player.cards && player.cards.length > 0 && (
          <div className={clsx(
            "absolute flex justify-center items-end transform scale-[0.6] sm:scale-[0.7] pointer-events-none z-0 w-20",
            index === 0 ? "left-1/2 -translate-x-1/2 -top-6 sm:-top-8" :
            index === 1 ? "-right-12 sm:-right-20 top-1/2 -translate-y-1/2" :
            index === 2 ? "left-1/2 -translate-x-1/2 -bottom-16 sm:-bottom-24" :
            index === 3 ? "left-1/2 -translate-x-1/2 -bottom-16 sm:-bottom-24" :
            index === 4 ? "-left-12 sm:-left-20 top-1/2 -translate-y-1/2" :
            index === 5 ? "left-1/2 -translate-x-1/2 -top-6 sm:-top-8" : ""
          )}>
            {player.cards.map((c: any, i: number) => (
              <div key={i} className={clsx("absolute origin-bottom bottom-0 transition-transform", i === 0 ? "rotate-[-12deg] -ml-4" : "rotate-[12deg] ml-4")}>
                <Card value={c} />
              </div>
            ))}
          </div>
        )}
        {player.status === 'thinking' && currentTable?.turnStartTime && (
          <div className="absolute -inset-[2px] z-20 pointer-events-none rounded-xl">
            <svg width="100%" height="100%" className="overflow-visible absolute inset-0 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
              {}
              <rect 
                ref={timerRef}
                className={clsx(
                  "stroke-current transition-all duration-100 ease-linear",
                  timeLeft !== null && timeLeft <= 5 ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,1)]" : "text-poker-accent drop-shadow-[0_0_10px_rgba(34,197,94,1)]"
                )}
                strokeWidth="4" 
                strokeLinecap="round" 
                fill="transparent" 
                x="0" y="0" width="100%" height="100%" rx="12" ry="12"
                pathLength="100"
                style={{ strokeDasharray: 100, strokeDashoffset: 0 }}
              />
            </svg>
          </div>
        )}
        {player.status === 'thinking' && !currentTable?.turnStartTime && (
          <div className="absolute -inset-[2px] z-20 pointer-events-none rounded-xl">
            <svg width="100%" height="100%" className="overflow-visible absolute inset-0">
              <rect 
                className="text-poker-accent stroke-current animate-pulse" 
                strokeWidth="4" 
                fill="transparent" 
                x="0" y="0" width="100%" height="100%" rx="12" ry="12"
              />
            </svg>
          </div>
        )}
      </motion.div>
      {player.status === 'folded' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-black/80 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider rotate-12">Fold</span>
        </div>
      )}
    </div>
  );
}