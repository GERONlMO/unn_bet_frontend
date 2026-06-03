'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { fetchPublicKey, encryptData } from '@/lib/crypto';
import { Eye, EyeOff } from 'lucide-react';
export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nickname, setNickname] = useState('');
  const { addToast } = useStore();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || !email || !password || !confirmPassword) {
      addToast('Заполните все поля', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast('Введите корректный email адрес', 'error');
      return;
    }
    const nicknameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!nicknameRegex.test(nickname)) {
      addToast('Логин должен быть от 3 до 20 символов и содержать только латинские буквы, цифры и _', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Пароль должен быть не короче 6 символов', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Пароли не совпадают', 'error');
      return;
    }
    try {
      const publicKey = await fetchPublicKey();
      const encryptedUsername = await encryptData(publicKey, nickname);
      const encryptedPassword = await encryptData(publicKey, password);
      const encryptedEmail = await encryptData(publicKey, email);
      await apiClient.post('/api/auth/register', { 
        encryptedUsername, 
        encryptedPassword,
        encryptedEmail
      });
      addToast('Регистрация успешна! Теперь войдите', 'success');
      router.push('/login');
    } catch (e) {
      addToast('Ошибка регистрации', 'error');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-poker-panel border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-poker-accent/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-poker-accent rounded-xl flex items-center justify-center rotate-12 shadow-lg">
            <span className="text-black font-black text-xl -rotate-12">♠</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">unn<span className="text-poker-accent">.bet</span></h1>
        </div>
        <h2 className="text-xl font-bold text-center mb-6">Регистрация</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input 
              type="text" 
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-poker-accent transition-colors"
              placeholder="player@unn.bet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Никнейм</label>
            <input 
              type="text" 
              value={nickname} onChange={e => setNickname(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-poker-accent transition-colors"
              placeholder="Player123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Пароль</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-poker-accent transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Подтверждение пароля</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-poker-accent transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-poker-accent text-black font-bold py-3 rounded-lg mt-2 hover:bg-poker-accent/80 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            Зарегистрироваться
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
          Уже есть аккаунт? <Link href="/login" className="text-poker-accent hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
}
