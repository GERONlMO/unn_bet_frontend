'use client';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Coins, Edit2, CheckCircle2, Monitor, LayoutDashboard } from 'lucide-react';
import { ProfileSettings } from '@/lib/mockGameState';
import clsx from 'clsx';
import { Card } from '@/components/Card';
import { InteractiveBackground } from '@/components/InteractiveBackground';
export default function ProfilePage() {
  const { isInitialized, isLoggedIn, profile, updateProfile, updateSettings, isBalanceLoading } = useStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push('/login');
    } else if (isInitialized && isLoggedIn) {
      setEditName(profile.nickname);
      setEditAvatar(profile.avatar || null);
    }
  }, [isInitialized, isLoggedIn, profile.nickname, profile.avatar, router]);
  if (!isInitialized || !isLoggedIn) return null;
  const handleSave = () => {
    if (editName.trim()) {
      updateProfile({ username: editName, avatar: editAvatar || undefined });
      setIsEditing(false);
    }
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setEditAvatar(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  const displayAvatar = isEditing ? editAvatar : profile.avatar;
  const avatarSrc = displayAvatar ? (displayAvatar.startsWith('data:') ? displayAvatar : `data:image/jpeg;base64,${displayAvatar}`) : null;
  return (
    <InteractiveBackground className="min-h-screen p-4 sm:p-8 flex flex-col gap-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 relative z-10">
        <header className="flex items-center justify-between">
          <Link href="/lobby" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-bold">Назад в лобби</span>
          </Link>
          <h1 className="text-xl font-bold">Профиль игрока</h1>
          <div className="w-20"></div>
        </header>
        <div className="bg-poker-panel border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className={`w-32 h-32 ${!avatarSrc ? profile.avatarColor : ''} rounded-full border-4 border-white/10 shadow-xl flex items-center justify-center relative overflow-hidden group`}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={profile.nickname} className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-white/50" />
                )}
                {isEditing && (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png, image/jpeg, image/webp" 
                      onChange={handleAvatarChange} 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 size={24} className="text-white mb-1" />
                      <span className="text-xs font-bold text-white">Изменить</span>
                    </button>
                  </>
                )}
              </div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded px-3 py-1.5 text-center text-white focus:outline-none focus:border-poker-accent w-32"
                  />
                  <button onClick={handleSave} className="text-poker-accent hover:text-poker-accent/80">
                    <CheckCircle2 size={24} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{profile.nickname}</h2>
                  <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white">
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-sm text-gray-400">Баланс фишек</span>
                <div className="flex items-center gap-2">
                  <Coins className="text-poker-gold" size={20} />
                  {isBalanceLoading ? (
                    <div className="h-8 w-24 bg-white/10 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-2xl font-bold text-poker-gold">{(profile?.balance || 0).toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-sm text-gray-400">Сыграно игр</span>
                {profile.gamesPlayed !== undefined ? (
                  <span className="text-2xl font-bold text-white">{profile.gamesPlayed}</span>
                ) : (
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse mt-1"></div>
                )}
              </div>
              <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-sm text-gray-400">Побед</span>
                {profile.wins !== undefined ? (
                  <span className="text-2xl font-bold text-white">{profile.wins}</span>
                ) : (
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse mt-1"></div>
                )}
              </div>
              <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-sm text-gray-400">Макс. выигрыш</span>
                {profile.bestWin !== undefined || profile.maxWin !== undefined ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-poker-accent">{(profile.bestWin || profile.maxWin || 0).toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="h-8 w-24 bg-white/10 rounded animate-pulse mt-1"></div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-poker-panel border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Monitor size={20} className="text-poker-accent" />
            Настройки визуала
          </h2>
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {}
              <div className="flex flex-col gap-3">
                <label className="text-sm text-gray-400 font-medium">Фон стола</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'classic', label: 'Классика' },
                    { id: 'neon', label: 'Неон' },
                    { id: 'dark', label: 'Тёмный' },
                    { id: 'none', label: 'Без фона' },
                    { id: 'casino', label: 'Казино' },
                    { id: 'matrix', label: 'Матрица' },
                    { id: 'ocean', label: 'Океан' },
                    { id: 'lava', label: 'Лава' }
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => updateSettings({ background: bg.id as ProfileSettings['background'] })}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        profile.settings?.background === bg.id 
                          ? 'bg-poker-accent/20 border-poker-accent text-white' 
                          : 'bg-black/30 border-white/5 text-gray-400 hover:bg-black/50 hover:text-gray-200'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
              {}
              <div className="flex flex-col gap-3">
                <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                  <LayoutDashboard size={14} />
                  Рубашка карт
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'blue', label: 'Синяя' },
                    { id: 'red', label: 'Красная' },
                    { id: 'gold', label: 'Золотая' },
                    { id: 'minimal', label: 'Минимализм' }
                  ].map((card) => (
                    <button
                      key={card.id}
                      onClick={() => updateSettings({ cardBack: card.id as ProfileSettings['cardBack'] })}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        profile.settings?.cardBack === card.id 
                          ? 'bg-poker-accent/20 border-poker-accent text-white' 
                          : 'bg-black/30 border-white/5 text-gray-400 hover:bg-black/50 hover:text-gray-200'
                      }`}
                    >
                      {card.label}
                    </button>
                  ))}
                </div>
              </div>
              {}
              <div className="flex flex-col gap-3">
                <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                  <LayoutDashboard size={14} />
                  Лицевая сторона карт
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'classic', label: 'Классика' },
                    { id: 'four-color', label: '4 цвета' },
                    { id: 'dark', label: 'Тёмная' },
                    { id: 'vintage', label: 'Винтаж' }
                  ].map((card) => (
                    <button
                      key={card.id}
                      onClick={() => updateSettings({ cardFront: card.id as ProfileSettings['cardFront'] })}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        profile.settings?.cardFront === card.id 
                          ? 'bg-poker-accent/20 border-poker-accent text-white' 
                          : 'bg-black/30 border-white/5 text-gray-400 hover:bg-black/50 hover:text-gray-200'
                      }`}
                    >
                      {card.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-6 border-t border-white/10">
              <label className="text-sm text-gray-400 font-medium w-full">Превью карт (рубашка и рука)</label>
              <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-start bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="relative w-16 h-24 sm:w-20 sm:h-28 mr-4 hover:-translate-y-2 transition-transform cursor-pointer">
                  <div className="absolute top-0 right-0 translate-x-2 -translate-y-2 opacity-50"><Card hidden className="w-full h-full" /></div>
                  <div className="absolute top-0 right-0 translate-x-1 -translate-y-1 opacity-70"><Card hidden className="w-full h-full" /></div>
                  <div className="relative z-10"><Card hidden className="w-full h-full" /></div>
                </div>
                <div className="hover:-translate-y-2 transition-transform cursor-pointer"><Card value="Ah" className="w-16 h-24 sm:w-20 sm:h-28" /></div>
                <div className="hover:-translate-y-2 transition-transform cursor-pointer"><Card value="Kd" className="w-16 h-24 sm:w-20 sm:h-28" /></div>
                <div className="hover:-translate-y-2 transition-transform cursor-pointer"><Card value="Qc" className="w-16 h-24 sm:w-20 sm:h-28" /></div>
                <div className="hover:-translate-y-2 transition-transform cursor-pointer"><Card value="Js" className="w-16 h-24 sm:w-20 sm:h-28" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InteractiveBackground>
  );
}