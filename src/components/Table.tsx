'use client';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { PlayerSeat } from './PlayerSeat';
import { Chip } from './Chip';
import { ActionPanel } from './ActionPanel';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { PokerHandsGuide } from './PokerHandsGuide';
import { useEffect, useState } from 'react';
const SEAT_POSITIONS = [
  "bottom-[-15%] sm:-bottom-20 left-[20%] sm:left-[25%]", 
  "top-1/2 -translate-y-1/2 -left-12 sm:-left-24", 
  "top-[-15%] sm:-top-20 left-[20%] sm:left-[25%]", 
  "top-[-15%] sm:-top-20 right-[20%] sm:right-[25%]", 
  "top-1/2 -translate-y-1/2 -right-12 sm:-right-24", 
  "bottom-[-15%] sm:-bottom-20 right-[20%] sm:right-[25%]", 
];
const getAvatarPosition = (index: number) => {
  switch (index) {
    case 0: return { left: "25%", top: "110%" };
    case 1: return { left: "-5%", top: "50%" };
    case 2: return { left: "25%", top: "-10%" };
    case 3: return { left: "75%", top: "-10%" };
    case 4: return { left: "105%", top: "50%" };
    case 5: return { left: "75%", top: "110%" };
    default: return { left: "50%", top: "50%" };
  }
};
const getBetPosition = (index: number) => {
  switch (index) {
    case 0: return { left: "25%", top: "75%" };
    case 1: return { left: "15%", top: "50%" };
    case 2: return { left: "25%", top: "25%" };
    case 3: return { left: "75%", top: "25%" };
    case 4: return { left: "85%", top: "50%" };
    case 5: return { left: "75%", top: "75%" };
    default: return { left: "50%", top: "50%" };
  }
};

const AnimatedBet = ({ amount, avatarPos, betPos, seatName }: { amount: number, avatarPos: any, betPos: any, seatName: string }) => {
  const [ghosts, setGhosts] = useState<{id: number, amount: number}[]>([]);

  const [prevAmount, setPrevAmount] = useState(0);
  useEffect(() => {
    if (amount > prevAmount) {
      const diff = amount - prevAmount;
      const newGhost = { id: Date.now(), amount: diff };
      setGhosts(prev => [...prev, newGhost]);

      setTimeout(() => {
        setGhosts(prev => prev.filter(g => g.id !== newGhost.id));
      }, 600);
    }
    setPrevAmount(amount);
  }, [amount, prevAmount]);
  return (
    <>
      {}
      <motion.div
        key={`bet-main-${seatName}`}

        initial={{ opacity: 0, scale: 0.5, ...betPos }}
        animate={{ opacity: 1, scale: 1, ...betPos }}
        exit={{ 
          opacity: 0, 
          scale: 0.3,
          left: "50%",
          top: "4%", 
          transition: { type: "tween", duration: 0.8, ease: "easeInOut" }
        }}
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      >
        <motion.div
          key={amount}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Chip amount={amount} />
        </motion.div>
      </motion.div>
      {}
      {ghosts.map(ghost => (
        <motion.div
          key={`ghost-${ghost.id}`}
          initial={{ opacity: 0, scale: 0.5, ...avatarPos }}
          animate={{ opacity: 1, scale: 1, ...betPos }}
          transition={{ type: "tween", duration: 0.5, ease: "easeOut" }}
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <Chip amount={ghost.amount} />
        </motion.div>
      ))}
    </>
  );
};
export const Table = () => {
  const { currentTable, leaveTable, mySeatIndex, isReady, toggleReady, addToast, profile, playerBalances } = useStore();
  const { background } = profile.settings;
  if (!currentTable) return null;
  return (
    <InteractiveBackground className="h-screen w-full flex flex-col md:flex-row overflow-hidden">
      {}
      <div className="flex-1 relative flex flex-col">
        {}
        <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
          <button 
            onClick={leaveTable}
            className="pointer-events-auto flex items-center gap-2 bg-black/50 hover:bg-black/70 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-white backdrop-blur-md border border-white/10 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-xs sm:text-sm">Назад в лобби</span>
          </button>
          <PokerHandsGuide />
        </div>
        {}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-12 pb-32 sm:pb-24 relative min-h-[500px] sm:min-h-[700px]">
          {}
          <div className="relative w-full max-w-[1000px] aspect-[4/5] sm:aspect-[2.2/1] bg-poker-tableDark rounded-[100px] sm:rounded-[240px] border-[12px] sm:border-[24px] border-[#3f2a14] shadow-2xl flex items-center justify-center mt-12 sm:mt-0">
            {}
            <div className="absolute inset-4 sm:inset-8 rounded-[80px] sm:rounded-[220px] border-2 border-white/10" />
            {}
            <motion.div 
              initial={{ x: "-50%" }}
              animate={{ y: [-2, 2, -2], x: "-50%" }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute top-[-10%] sm:-top-16 left-[50%] z-20 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white text-black font-black text-lg sm:text-2xl flex items-center justify-center border-4 sm:border-[6px] border-gray-300 shadow-2xl"
            >
              D
            </motion.div>
            {}
            <div className="absolute top-[2%] sm:top-[4%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
              <span className="text-[8px] sm:text-[10px] font-bold text-white/70 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">Pot</span>
              <div className="flex items-center gap-2">
                <Chip amount={currentTable.pot || 0} />
                <span className="text-xs sm:text-sm font-bold text-poker-gold">{currentTable.pot || 0}</span>
              </div>
            </div>
            {}
            <div className="absolute top-[25%] sm:top-[30%] opacity-20 pointer-events-none flex flex-col items-center">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">{currentTable.name}</h2>
              <p className="text-xs sm:text-sm text-white/70 font-bold uppercase tracking-widest mt-1">NL{currentTable.minBet || 10}</p>
            </div>
            {}
            <div className="flex gap-1 sm:gap-2 z-20 absolute top-1/2 -translate-y-1/2">
              {(currentTable.tableDeck?.cards || currentTable.communityCards || []).map((card, i) => (
                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
                  <Card value={card} />
                </motion.div>
              ))}
              {Array.from({ length: 5 - ((currentTable.tableDeck?.cards || currentTable.communityCards)?.length || 0) }).map((_, i) => (
                <Card key={`empty-${i}`} hidden className="opacity-50" />
              ))}
            </div>
            {}
            {Array.from({ length: currentTable.maxPlayers || 6 }).map((_, i) => {
              const seatName = currentTable.seats ? currentTable.seats[i.toString()] : null;
              let player = (currentTable.players || [])[i] || null;
              if (currentTable.seats) {
                if (seatName) {
                  const stateFromServer = currentTable.playerStates?.[seatName] || {};
                  const playerProfile = currentTable.playerProfiles?.[seatName];
                  let avatarSrc = playerProfile?.avatar;
                  if (avatarSrc && !avatarSrc.startsWith('data:')) {
                    avatarSrc = `data:image/png;base64,${avatarSrc}`;
                  }

                  let isPlayerReady = false;
                  if (seatName === profile.nickname && isReady) isPlayerReady = true;
                  if (stateFromServer.isReady || stateFromServer.status === 'ready' || player?.status === 'ready') isPlayerReady = true;
                  if (Array.isArray(currentTable.readyPlayers) && currentTable.readyPlayers.includes(seatName)) isPlayerReady = true;
                  if (Array.isArray(currentTable.readyStatus) && currentTable.readyStatus.includes(seatName)) isPlayerReady = true;
                  if (currentTable.readyStatus && typeof currentTable.readyStatus === 'object' && !Array.isArray(currentTable.readyStatus) && currentTable.readyStatus[seatName]) isPlayerReady = true;
                  player = { 
                    ...player, 
                    id: seatName, 
                    name: seatName, 
                    avatar: avatarSrc || player?.avatar,
                    profile: playerProfile,
                    stack: stateFromServer.balance ?? stateFromServer.stack ?? stateFromServer.chips ?? playerBalances[seatName] ?? player?.stack ?? 0, 
                    currentBet: stateFromServer.currentBet ?? player?.currentBet ?? 0, 
                    isActive: stateFromServer.isActive ?? player?.isActive ?? true, 
                    status: (currentTable.status === 'WAITING' || currentTable.status === 'FINISHED') 
                      ? (isPlayerReady ? 'ready' : 'not_ready') 
                      : (stateFromServer.hasFolded || stateFromServer.status === 'folded' || player?.status === 'folded' ? 'folded' : (currentTable.currentTurn === seatName ? 'thinking' : 'active')),  
                    cards: stateFromServer.cards,
                    seatIndex: i 
                  };
                } else {
                  player = null;
                }
              }
              return <PlayerSeat key={i} index={i} player={player} positionClass={SEAT_POSITIONS[i]} />;
            })}
            {}
            <AnimatePresence>
              {Array.from({ length: currentTable.maxPlayers || 6 }).map((_, i) => {
                const seatName = currentTable.seats ? currentTable.seats[i.toString()] : null;
                const stateFromServer = seatName ? (currentTable.playerStates?.[seatName] || {}) : {};
                const currentBet = stateFromServer.currentBet || 0;
                const isWinner = currentTable?.status === 'FINISHED' && currentTable.winner && (
                  Array.isArray(currentTable.winner) 
                    ? currentTable.winner.includes(seatName || '')
                    : currentTable.winner === seatName
                );
                if (currentBet > 0 && !isWinner) {
                  return (
                    <AnimatedBet 
                      key={`animated-bet-${seatName}`}
                      amount={currentBet} 
                      avatarPos={getAvatarPosition(i)} 
                      betPos={getBetPosition(i)} 
                      seatName={seatName || ''} 
                    />
                  );
                }
                return null;
              })}
            </AnimatePresence>
            {mySeatIndex !== null && (currentTable.playerStates?.[profile.nickname]?.cards || currentTable.myCards || []).length > 0 && (
              <div className="absolute -bottom-8 sm:-bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-2 rotate-[-5deg]">
                {(currentTable.playerStates?.[profile.nickname]?.cards || currentTable.myCards || []).map((card: any, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ y: 100, opacity: 0, rotateZ: 0 }}
                    animate={{ y: 0, opacity: 1, rotateZ: i === 1 ? 10 : 0 }}
                    transition={{ delay: 0.5 + i * 0.2, type: 'spring' }}
                    className={i === 1 ? "ml-[-10px] sm:ml-[-20px]" : ""}
                  >
                    <Card value={card} className="w-14 h-20 sm:w-16 sm:h-24 shadow-2xl border-white/30" />
                  </motion.div>
                ))}
              </div>
            )}
            {}
            <AnimatePresence>
              {mySeatIndex !== null && (currentTable.status === 'WAITING' || currentTable.status === 'FINISHED') && (
                <div className="absolute -bottom-36 sm:-bottom-44 left-1/2 -translate-x-1/2 z-40 flex justify-center">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <motion.button
                      animate={!isReady ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0 rgba(34,197,94,0)", "0 0 20px rgba(34,197,94,0.5)", "0 0 0 rgba(34,197,94,0)"] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      onClick={toggleReady}
                      className={`flex items-center justify-center whitespace-nowrap gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-black text-sm sm:text-xl uppercase tracking-wider transition-colors ${isReady ? 'bg-black/50 text-white border-2 border-white/20' : 'bg-poker-accent text-black shadow-2xl'}`}
                    >
                      {isReady ? (
                        <>Отменить готовность</>
                      ) : (
                        <>
                          <CheckCircle2 size={24} /> ГОТОВ
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {}
        <AnimatePresence>
          {mySeatIndex !== null && currentTable.status === 'IN_PROGRESS' && (
            <div className="absolute bottom-0 left-0 right-0 z-40 sm:px-4" onClick={() => {
              if (currentTable.currentTurn !== profile.nickname) {
                addToast('Сейчас не ваш ход', 'info');
              }
            }}>
              <div className={clsx("transition-all duration-300", currentTable.currentTurn !== profile.nickname && "pointer-events-none opacity-50 grayscale")}>
                <ActionPanel />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </InteractiveBackground>
  );
}