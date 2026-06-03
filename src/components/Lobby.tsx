'use client';
import { useStore } from '@/store/useStore';
import { MOCK_TABLES } from '@/lib/mockGameState';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Coins, Users, Shield, Loader2 } from 'lucide-react';
export const Lobby = () => {
  const { balance, joinTable, isLoadingTable } = useStore();
  const router = useRouter();
  const handleJoin = (id: string) => {
    joinTable(id);
    setTimeout(() => {
      router.push(`/table/${id}`);
    }, 800);
  };
  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row items-center justify-between bg-poker-panel border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-poker-accent rounded-xl flex items-center justify-center rotate-12 shadow-lg">
            <span className="text-black font-black text-xl -rotate-12">♠</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">unn<span className="text-poker-accent">.bet</span></h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-white/5">
            <Coins size={16} className="text-poker-gold" />
            <span className="font-bold text-white text-sm sm:text-base">{balance.toLocaleString()}</span>
          </div>
          <button className="bg-poker-accent text-black text-sm sm:text-base font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-poker-accent/80 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            Пополнить
          </button>
          <div className="w-10 h-10 hidden sm:flex bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full border-2 border-white/20 items-center justify-center shadow-lg cursor-pointer">
            <User size={20} className="text-white" />
          </div>
        </div>
      </header>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-gray-200">Доступные столы</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white/10 rounded-md text-xs sm:text-sm font-medium hover:bg-white/20">NL10</button>
            <button className="px-3 py-1.5 bg-white/10 rounded-md text-xs sm:text-sm font-medium hover:bg-white/20">NL100</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(MOCK_TABLES).map((table, i) => (
            <motion.div 
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-poker-panel border border-white/10 rounded-xl p-5 hover:border-poker-accent/50 transition-colors group flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-poker-accent/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-poker-accent/10"></div>
              <div className="flex justify-between items-start z-10">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{table.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Shield size={14} />
                    <span>{table.limit}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded text-xs sm:text-sm text-gray-300">
                  <Users size={14} />
                  <span>{table.players.filter(p => p?.isActive).length} / {table.maxPlayers}</span>
                </div>
              </div>
              <div className="mt-2 z-10">
                <button 
                  onClick={() => handleJoin(table.id)}
                  disabled={isLoadingTable}
                  className="w-full py-2.5 bg-white/5 hover:bg-poker-accent hover:text-black border border-white/10 hover:border-poker-accent text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoadingTable ? <Loader2 size={18} className="animate-spin" /> : "СЕСТЬ"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}