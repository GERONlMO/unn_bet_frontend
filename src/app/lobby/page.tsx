'use client';
import { useStore } from '@/store/useStore';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table } from '@/components/Table';
import { User, Coins, Users, Shield, Lock, Unlock, Plus, Search, Filter, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import clsx from 'clsx';
export default function LobbyPage() {
  const { isInitialized, isLoggedIn, nickname, balance, isBalanceLoading, lobbies, joinTable, logout, currentTable, createLobby, fetchLobbies, fetchBalance, profile } = useStore();
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [lobbyName, setLobbyName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [lobbyPassword, setLobbyPassword] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [createLimit, setCreateLimit] = useState('NL10');
  const [createTurnTimeLimit, setCreateTurnTimeLimit] = useState<number>(30000);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlayers, setFilterPlayers] = useState<number | 'all'>('all');
  const [filterLimit, setFilterLimit] = useState<string | 'all'>('all');
  const [filterSpeed, setFilterSpeed] = useState<number | 'all'>('all');
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/login');
    } else if (isInitialized && isLoggedIn) {
      if (!currentTable) {
        fetchLobbies();
        fetchBalance();
      }
      const interval = setInterval(() => {
        if (!useStore.getState().currentTable) {
          fetchLobbies();
          fetchBalance();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isInitialized, isLoggedIn, router, fetchLobbies, fetchBalance, currentTable]);
  const filteredLobbies = useMemo(() => {
    return (lobbies || []).filter(lobby => {
      const lobbyNameStr = lobby.name || '';
      const matchesSearch = lobbyNameStr.toLowerCase().includes((searchQuery || '').toLowerCase());
      const matchesPlayers = filterPlayers === 'all' || lobby.maxPlayers === filterPlayers;
      const lobbyLimit = lobby.limit || ((lobby as any).minBet ? `NL${(lobby as any).minBet}` : 'NL10');
      const matchesLimit = filterLimit === 'all' || lobbyLimit === filterLimit;
      const matchesSpeed = filterSpeed === 'all' || lobby.turnTimeLimit === filterSpeed || (!lobby.turnTimeLimit && filterSpeed === 30000);
      return matchesSearch && matchesPlayers && matchesLimit && matchesSpeed;
    });
  }, [lobbies, searchQuery, filterPlayers, filterLimit, filterSpeed]);
  if (!isInitialized || !isLoggedIn) return null;
  const handleCreate = () => {
    if (!lobbyName.trim() || lobbyName.length > 24) return;
    createLobby(lobbyName, isPrivate, maxPlayers, createLimit, createTurnTimeLimit);
    setIsCreateModalOpen(false);
    setLobbyName('');
    setIsPrivate(false);
    setLobbyPassword('');
    setMaxPlayers(6);
    setCreateLimit('NL10');
    setCreateTurnTimeLimit(30000);
  };
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  const avatarSrc = profile?.avatar ? (profile.avatar.startsWith('data:') ? profile.avatar : `data:image/jpeg;base64,${profile.avatar}`) : null;
  return (
    <div className="min-h-screen relative">
      <AnimatePresence>
        {!currentTable ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 sm:p-8 max-w-6xl mx-auto flex flex-col gap-6 sm:gap-8 min-h-screen"
          >
            {}
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
                  {isBalanceLoading ? (
                    <div className="h-4 sm:h-5 w-16 bg-white/10 rounded animate-pulse"></div>
                  ) : (
                    <span className="font-bold text-white text-sm sm:text-base">{(balance || 0).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="flex items-center gap-2 hover:text-poker-accent transition-colors group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full border-2 border-white/20 flex items-center justify-center shadow-lg overflow-hidden group-hover:border-poker-accent transition-colors">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt={nickname} className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} className="text-white" />
                      )}
                    </div>
                    <span className="font-bold text-sm hidden sm:inline">{nickname}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-white px-2">Выйти</button>
                </div>
              </div>
            </header>
            {}
            <div className="flex flex-col sm:flex-row gap-4 bg-poker-panel p-4 rounded-xl border border-white/10 shadow-lg">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск лобби..." 
                  className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-poker-accent text-sm"
                />
              </div>
              <div className="flex flex-wrap sm:flex-nowrap gap-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <select 
                    value={filterSpeed} 
                    onChange={(e) => setFilterSpeed(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-poker-accent appearance-none min-w-[120px]"
                  >
                    <option value="all">Любая скорость</option>
                    <option value="30000">Обычная (30с)</option>
                    <option value="15000">Быстрая (15с)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select 
                    value={filterLimit} 
                    onChange={(e) => setFilterLimit(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-poker-accent appearance-none min-w-[100px]"
                  >
                    <option value="all">Все лимиты</option>
                    <option value="NL10">NL10</option>
                    <option value="NL50">NL50</option>
                    <option value="NL100">NL100</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <select 
                    value={filterPlayers} 
                    onChange={(e) => setFilterPlayers(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-poker-accent appearance-none min-w-[120px]"
                  >
                    <option value="all">Все форматы</option>
                    <option value="2">2 игрока</option>
                    <option value="3">3 игрока</option>
                    <option value="4">4 игрока</option>
                    <option value="5">5 игроков</option>
                    <option value="6">6 игроков</option>
                  </select>
                </div>
              </div>
            </div>
            {}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-200">Доступные лобби ({filteredLobbies.length})</h2>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full sm:w-auto bg-poker-accent text-black text-sm sm:text-base font-bold px-4 py-2 rounded-lg hover:bg-poker-accent/80 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Создать лобби
                </button>
              </div>
              {filteredLobbies.length === 0 ? (
                <div className="text-center text-gray-400 py-10 bg-black/20 rounded-xl border border-white/5">
                  Лобби с такими параметрами не найдено
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLobbies.map((lobby, i) => {
                    const lobbyKey = (lobby as any).id || (lobby as any).roomId || lobby.name || i;
                    return (
                    <motion.div 
                      key={lobbyKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-poker-panel border border-white/10 rounded-xl p-5 hover:border-poker-accent/50 transition-colors group flex flex-col gap-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-poker-accent/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-poker-accent/10"></div>
                      <div className="flex justify-between items-start z-10 gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {lobby.isPrivate ? <Lock size={14} className="text-gray-400 shrink-0" /> : <Unlock size={14} className="text-poker-accent shrink-0" />}
                            <h3 className="text-lg font-bold text-white truncate" title={lobby.name || 'Без имени'}>
                              {lobby.name && lobby.name.length > 12 ? lobby.name.slice(0, 12) + '...' : (lobby.name || 'Без имени')}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Shield size={14} />
                            <span>{lobby.limit || ((lobby as any).minBet ? `NL${(lobby as any).minBet}` : 'NL10')}</span>
                            <span className="mx-1">•</span>
                            <Clock size={14} />
                            <span>{lobby.turnTimeLimit === 15000 ? '15s' : '30s'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded text-xs sm:text-sm text-gray-300 shrink-0">
                          <Users size={14} />
                          <span>{lobby.players?.length || 0} / {lobby.maxPlayers || 6}</span>
                        </div>
                      </div>
                      <div className="mt-2 z-10">
                        <button 
                          onClick={() => joinTable(lobby.name)} 
                          className="w-full py-2.5 bg-white/5 hover:bg-poker-accent hover:text-black border border-white/10 hover:border-poker-accent text-white font-bold rounded-lg transition-all"
                        >
                          Присоединиться
                        </button>
                      </div>
                    </motion.div>
                  )})}
                </div>
              )}
            </div>
            {}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Создание лобби">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Название лобби</label>
                  <input 
                    type="text" 
                    value={lobbyName} onChange={e => setLobbyName(e.target.value)}
                    maxLength={24}
                    className={clsx(
                      "w-full bg-black/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-poker-accent",
                      lobbyName.length >= 24 ? "border-red-500" : "border-white/10"
                    )}
                    placeholder="Например, Вечерний покер"
                  />
                  {lobbyName.length >= 24 && (
                    <span className="text-red-500 text-xs mt-1 block">
                      Максимальная длина названия — 24 символа
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-white/5">
                  <input 
                    type="checkbox" 
                    id="isPrivate" 
                    checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 accent-poker-accent"
                  />
                  <label htmlFor="isPrivate" className="text-sm font-medium text-white cursor-pointer select-none">Приватное лобби</label>
                </div>
                {isPrivate && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Пароль</label>
                    <input 
                      type="password" 
                      value={lobbyPassword} onChange={e => setLobbyPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-poker-accent"
                      placeholder="••••••••"
                    />
                  </motion.div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Максимум игроков</label>
                    <div className="flex gap-2">
                      {[2, 3, 4, 5, 6].map(num => (
                        <button 
                          key={num}
                          onClick={() => setMaxPlayers(num)}
                          className={`flex-1 py-1.5 rounded-lg border font-bold text-sm transition-colors ${maxPlayers === num ? 'bg-poker-accent text-black border-poker-accent' : 'bg-black/50 border-white/10 text-white hover:bg-white/5'}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Лимит</label>
                    <select 
                      value={createLimit}
                      onChange={e => setCreateLimit(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-poker-accent"
                    >
                      <option value="NL10">NL10</option>
                      <option value="NL50">NL50</option>
                      <option value="NL100">NL100</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Скорость игры</label>
                  <select 
                    value={createTurnTimeLimit}
                    onChange={e => setCreateTurnTimeLimit(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-poker-accent"
                  >
                    <option value={30000}>Обычная игра (30с)</option>
                    <option value={15000}>Быстрая игра (15с)</option>
                  </select>
                </div>
                <button 
                  onClick={handleCreate}
                  disabled={!lobbyName.trim()}
                  className="w-full bg-poker-accent text-black font-bold py-3 rounded-lg mt-4 hover:bg-poker-accent/80 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:shadow-none"
                >
                  Создать
                </button>
              </div>
            </Modal>
          </motion.div>
        ) : (
          <motion.div
            key="table-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950 overflow-hidden"
          >
            <Table />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}