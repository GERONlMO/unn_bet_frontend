import { create } from 'zustand';
import { MOCK_TABLES, MockTableState, MockLobby, MOCK_LOBBIES, DEFAULT_PROFILE_SETTINGS, generateEmptyTable, ProfileSettings } from '@/lib/mockGameState';
import { apiClient, API_URL } from '@/lib/api';
import { fetchPublicKey, encryptData } from '@/lib/crypto';
const translateError = (e: any, defaultMsg: string): string => {
  let msg = '';
  if (typeof e.response?.data === 'string') {
    try {
      const parsed = JSON.parse(e.response.data);
      msg = parsed.message || '';
    } catch {
      msg = e.response.data;
    }
  } else if (e.response?.data?.message) {
    msg = e.response.data.message;
  }
  if (!msg) return defaultMsg;

  if (msg === 'Not authenticated') return 'Необходима авторизация';
  if (msg === 'Invalid access') return 'Неверный логин или пароль';
  if (msg === 'Forbidden') return 'Доступ запрещен';
  if (msg === 'Invalid password') return 'Неверный пароль';
  if (msg === 'Admin access required') return 'Требуются права администратора';

  if (msg === 'Room not found') return 'Комната не найдена';
  if (msg.startsWith('Room not found with name')) return 'Комната не найдена';
  if (msg === 'User not found') return 'Пользователь не найден';

  if (msg === 'Room with this name already exists') return 'Комната с таким именем уже существует';
  if (msg === 'Cannot join a room while the game is in progress') return 'Невозможно войти: игра уже идёт';
  if (msg === 'Room is full') return 'Комната заполнена';
  if (msg === 'Cannot change seats while the game is in progress') return 'Нельзя сменить место во время игры';
  if (msg === 'Seat is already taken') return 'Место уже занято';
  if (msg === 'Cannot change ready status while the game is in progress') return 'Нельзя изменить готовность во время игры';
  if (msg === 'Username already exists') return 'Имя пользователя уже занято';
  if (msg === 'Round transition in progress') return 'Подождите, идет переход раунда';
  if (msg === 'Game is not in progress') return 'Игра еще не началась';

  if (msg === 'Username cannot be empty') return 'Имя пользователя не может быть пустым';
  if (msg === 'Username contains invalid characters') return 'Имя пользователя содержит недопустимые символы';
  if (msg === 'Username must be 3-24 characters: letters, numbers, _ or -') return 'Имя пользователя должно быть от 3 до 24 символов';
  if (msg === 'Password cannot be empty') return 'Пароль не может быть пустым';
  if (msg === 'Password must be 6-128 characters') return 'Пароль должен быть от 6 до 128 символов';
  if (msg === 'Password contains invalid characters') return 'Пароль содержит недопустимые символы';
  if (msg === 'Password is too long') return 'Пароль слишком длинный';
  if (msg === 'Email contains invalid characters') return 'Email содержит недопустимые символы';
  if (msg === 'Invalid email format') return 'Неверный формат Email';
  if (msg === 'Encrypted value is required') return 'Требуются зашифрованные данные';
  if (msg === 'Invalid encrypted payload encoding') return 'Неверная кодировка данных';
  if (msg === 'Failed to decrypt credentials') return 'Ошибка расшифровки данных';
  if (msg === 'Invalid token') return 'Недействительный токен';

  if (msg === 'Avatar image is too large (max ~1.5 MB)') return 'Размер аватара превышает лимит (1.5 МБ)';
  if (msg === 'Invalid avatar data URL') return 'Неверный формат аватара';
  if (msg === 'Avatar must be JPEG, PNG, WebP or GIF') return 'Аватар должен быть в формате JPEG, PNG, WebP или GIF';
  if (msg === 'Avatar is not valid base64') return 'Аватар не является валидной base64 строкой';

  if (msg === 'Room name cannot be empty') return 'Имя лобби не может быть пустым';
  if (msg === 'Room name cannot exceed 24 characters') return 'Имя лобби не может превышать 24 символа';
  if (msg === 'Room name contains invalid characters') return 'Имя лобби содержит недопустимые символы';
  if (msg === 'You must join the room first') return 'Вы должны сначала войти в комнату';
  if (msg === 'Invalid seat number') return 'Неверный номер места';

  if (msg === 'Not enough seated players to start') return 'Недостаточно игроков для старта';
  if (msg === 'Not your turn') return 'Сейчас не ваш ход';
  if (msg === 'Cannot raise, all other players are all-in') return 'Нельзя повысить: остальные игроки в олл-ине';
  if (msg === 'Cannot raise more than your balance') return 'Нельзя поставить больше, чем есть на балансе';
  if (msg === 'Raise must be higher than current bet') return 'Рейз должен быть выше текущей ставки';
  if (msg === 'Cannot check, must call or fold') return 'Нельзя чекнуть, нужно коллировать или сбросить (fold)';

  if (msg === 'Insufficient funds') return 'Недостаточно средств';
  if (msg.startsWith('Insufficient funds or wallet error for user:')) return 'Недостаточно средств или ошибка кошелька';

  const lowerMsg = msg.toLowerCase();
  if (lowerMsg.includes('in progress')) return 'Игра уже идёт';
  if (lowerMsg.includes('full')) return 'Комната заполнена';
  if (lowerMsg.includes('already taken')) return 'Место уже занято';
  if (lowerMsg.includes('not found')) return 'Не найдено';
  if (lowerMsg.includes('password')) return 'Неверный пароль';
  if (lowerMsg.includes('insufficient')) return 'Недостаточно средств';
  return msg;
};
export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}
interface PokerUIState {
  isInitialized: boolean;
  isLoggedIn: boolean;
  nickname: string;
  balance: number;
  isBalanceLoading: boolean;
  hasLoadedBalance: boolean;
  profile: any;

  lobbies: MockLobby[];

  currentTable: MockTableState | null;
  isLoadingTable: boolean;
  mySeatIndex: number | null;
  isReady: boolean;

  toasts: Toast[];

  login: (username: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { username?: string; avatar?: string }) => Promise<void>;
  fetchBalance: () => void;
  fetchProfile: () => Promise<void>;
  fetchLobbies: () => void;
  updateSettings: (settings: Partial<ProfileSettings>) => void;
  createLobby: (name: string, isPrivate: boolean, maxPlayers: number, limit: string, turnTimeLimit: number) => void;
  joinTable: (tableId: string) => void;
  leaveTable: () => void;
  takeSeat: (seatIndex: number) => void;
  toggleReady: () => void;
  gameAction: (action: 'fold' | 'check' | 'call' | 'raise', amount?: number) => Promise<void>;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  playerBalances: Record<string, number>;
  fetchPlayerBalance: (username: string, force?: boolean) => Promise<void>;
  initSettings: () => void;
  connectSSE: (roomId: string) => void;
}
export const useStore = create<PokerUIState>((set, get) => ({
  isInitialized: false,
  isLoggedIn: false,
  nickname: '',
  balance: 0,
  isBalanceLoading: false,
  hasLoadedBalance: false,
  profile: {
    settings: DEFAULT_PROFILE_SETTINGS,
    avatarColor: 'bg-zinc-800'
  },
  lobbies: [],
  currentTable: null,
  isLoadingTable: false,
  mySeatIndex: null,
  isReady: false,
  toasts: [],
  playerBalances: {},
  initSettings: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const nickname = localStorage.getItem('nickname') || '';
      if (token) {
        set(state => ({
          isLoggedIn: true,
          nickname,
          profile: { ...state.profile, nickname },
          isInitialized: true
        }));
        setTimeout(() => {
          get().fetchProfile();
          get().fetchBalance();
        }, 0);
      } else {
        set({ isInitialized: true });
      }
      const saved = localStorage.getItem('poker_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          set(state => ({
            profile: {
              ...state.profile,
              settings: { ...state.profile.settings, ...parsed }
            }
          }));
        } catch (e) {
          console.error('Failed to parse settings from localStorage', e);
        }
      }
    }
  },
  fetchPlayerBalance: async (username: string, force: boolean = false) => {
    if (!force && get().playerBalances[username] !== undefined) return;
    try {
      const res = await apiClient.get(`/api/wallet/${username}`);
      set(state => ({
        playerBalances: {
          ...state.playerBalances,
          [username]: res.data.balance || 0
        }
      }));
    } catch (e) {
      console.error(`Ошибка загрузки баланса игрока ${username}`, e);
    }
  },
  login: async (username: string, password?: string) => {
    try {
      if (password) {
        const publicKey = await fetchPublicKey();
        const encryptedUsername = await encryptData(publicKey, username);
        const encryptedPassword = await encryptData(publicKey, password);
        const res = await apiClient.post('/api/auth/login', { 
          encryptedUsername, 
          encryptedPassword 
        });
        let token = '';
        if (typeof res.data === 'string') {
          token = res.data;
        } else if (res.data) {
          token = res.data.token || res.data.jwt || res.data.accessToken || res.data.jwtToken;
        }
        if (!token && res.headers['authorization']) {
          token = res.headers['authorization'].replace('Bearer ', '');
        }
        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('nickname', username);
        } else {
          console.error('Не удалось найти токен в ответе сервера:', res.data);
        }
      }

      let balance = 0;
      try {
        const walletRes = await apiClient.get(`/api/wallet/${username}`);
        balance = walletRes.data.balance || 0;
      } catch (e) {
        console.error("Ошибка загрузки баланса", e);
      }
      set({ isLoggedIn: true, nickname: username, balance, profile: { ...get().profile, nickname: username, balance }, hasLoadedBalance: true });
      get().addToast(`Добро пожаловать, ${username}`, 'success');

      get().fetchProfile();
    } catch (e) {
      get().addToast('Ошибка входа: неверный логин или пароль', 'error');
      throw e;
    }
  },
  logout: async () => {
    try {
      await apiClient.post('/api/auth/exit');
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    set({ isLoggedIn: false, nickname: '', currentTable: null, mySeatIndex: null, isReady: false, hasLoadedBalance: false });
    get().addToast('Вы вышли из аккаунта', 'info');
  },
  fetchProfile: async () => {
    try {
      const res = await apiClient.get('/api/profile/get');
      set(state => ({
        profile: { ...state.profile, ...res.data },
        nickname: res.data.username || state.nickname
      }));
    } catch (e) {
      console.error("Ошибка загрузки профиля", e);
    }
  },
  updateProfile: async (updates: { username?: string; avatar?: string }) => {
    try {
      const res = await apiClient.post('/api/profile/edit', updates);
      set(state => ({ 
        profile: { ...state.profile, ...res.data }, 
        nickname: res.data.username || state.nickname 
      }));
      get().addToast('Профиль обновлён', 'success');
    } catch (e) {
      get().addToast('Ошибка обновления профиля', 'error');
    }
  },
  fetchBalance: async () => {
    const { nickname, hasLoadedBalance } = get();
    if (!nickname) return;
    if (!hasLoadedBalance) {
      set({ isBalanceLoading: true });
    }
    try {
      const res = await apiClient.get(`/api/wallet/${nickname}`);
      set({ balance: res.data.balance, profile: { ...get().profile, balance: res.data.balance }, isBalanceLoading: false, hasLoadedBalance: true });
    } catch (e) {
      console.error("Ошибка загрузки баланса", e);
      set({ isBalanceLoading: false, hasLoadedBalance: true });
    }
  },
  updateSettings: (settings: Partial<ProfileSettings>) => {
    set(state => {
      const newSettings = { ...state.profile.settings, ...settings };
      if (typeof window !== 'undefined') {
        localStorage.setItem('poker_settings', JSON.stringify(newSettings));
      }
      return {
        profile: {
          ...state.profile,
          settings: newSettings
        }
      };
    });
    get().addToast('Настройки сохранены', 'success');
  },
  fetchLobbies: async () => {
    try {
      const res = await apiClient.get('/api/lobby/all');
      set({ lobbies: Array.isArray(res.data) ? res.data : [] });
    } catch (e) {
      console.error(e);
      set({ lobbies: [] });
    }
  },
  createLobby: async (name: string, isPrivate: boolean, maxPlayers: number, limit: string, turnTimeLimit: number) => {
    try {
      const minBet = parseInt(limit.replace('NL', '')) || 10;
      const res = await apiClient.post('/api/lobby/create', { 
        name, 
        isPrivate, 
        password: '', 
        maxPlayers, 
        minBet,
        turnTimeLimit
      });
      const newRoom = res.data;
      set(state => ({ lobbies: [newRoom, ...state.lobbies] }));
      get().addToast(`Лобби "${name}" создано`, 'success');
      get().joinTable(newRoom.name || newRoom.id);
    } catch (e: any) {
      if (e.response?.status === 409) {
        get().addToast(translateError(e, 'Имя лобби уже занято'), 'error');
      } else if (e.response?.status === 400) {
        get().addToast(translateError(e, 'Некорректное имя лобби'), 'error');
      } else {
        get().addToast(translateError(e, 'Ошибка создания лобби'), 'error');
      }
    }
  },
  joinTable: async (tableId: string) => {
    set({ isLoadingTable: true, mySeatIndex: null, isReady: false });
    try {
      const res = await apiClient.post('/api/lobby/join', { roomName: tableId, password: '' });
      let tableData = res.data;
      if (typeof tableData === 'string') {
        try { tableData = JSON.parse(tableData); } catch (e) {}
      }
      if (Array.isArray(tableData) && tableData.length > 0) {
        tableData = tableData[0];
      }

      const roomId = tableData.id || tableData.roomId || tableData.name;
      const updates: Partial<PokerUIState> = { currentTable: tableData, isLoadingTable: false };
      if (tableData.viewerBalance !== undefined) {
        updates.balance = tableData.viewerBalance;
        updates.profile = { ...get().profile, balance: tableData.viewerBalance };
      }
      set(updates);
      get().connectSSE(roomId); 
    } catch (e: any) {
      set({ isLoadingTable: false });
      if (e.response?.status === 409) {
        get().addToast(translateError(e, 'Конфликт состояния комнаты'), 'error');
      } else if (e.response?.status === 404) {
        get().addToast(translateError(e, 'Комната не найдена'), 'error');
      } else if (e.response?.status === 403) {
        get().addToast(translateError(e, 'Неверный пароль'), 'error');
      } else if (e.response?.status === 401) {
        get().addToast(translateError(e, 'Вы не авторизованы'), 'error');
      } else if (e.response?.status === 400) {
        get().addToast(translateError(e, 'Некорректный запрос'), 'error');
      } else {
        get().addToast(translateError(e, 'Ошибка подключения к столу'), 'error');
      }
    }
  },
  leaveTable: async () => {
    const { currentTable } = get();
    if (currentTable) {
      try {
        const roomId = currentTable.id || (currentTable as any).roomId || currentTable.name || '';
        await apiClient.post(`/api/lobby/leave?roomId=${roomId}`);
      } catch (e) {
        console.error(e);
      }
    }

    const currentSSE = (window as any).currentGameSSE;
    if (currentSSE) {
      currentSSE.close();
      (window as any).currentGameSSE = null;
    }
    set({ currentTable: null, mySeatIndex: null, isReady: false });
  },
  takeSeat: async (seatIndex: number) => {
    const { currentTable } = get();
    if (!currentTable) return;
    try {
      const roomId = currentTable.id || (currentTable as any).roomId || currentTable.name;
      await apiClient.post(`/api/lobby/seat?roomId=${roomId}&seatNumber=${seatIndex}`);

      set({ 
        mySeatIndex: seatIndex,
        isReady: false
      });
    } catch (e: any) {
      if (e.response?.status === 409) {
        get().addToast(translateError(e, 'Место уже занято'), 'error');
      } else if (e.response?.status === 400) {
        get().addToast(translateError(e, 'Неверный номер места'), 'error');
      } else {
        get().addToast(translateError(e, 'Ошибка при посадке за стол'), 'error');
      }
    }
  },
  toggleReady: async () => {
    const { currentTable, mySeatIndex, isReady } = get();
    if (!currentTable || mySeatIndex === null) return;
    const newIsReady = !isReady;
    try {
      const roomId = currentTable.id || (currentTable as any).roomId || currentTable.name;
      await apiClient.post(`/api/lobby/ready?roomId=${roomId}&ready=${newIsReady}`);

      set({ isReady: newIsReady });
      get().addToast(newIsReady ? 'Вы готовы к игре' : 'Вы не готовы', 'info');
    } catch (e: any) {
      get().addToast(translateError(e, 'Ошибка смены статуса'), 'error');
    }
  },
  gameAction: async (action: 'fold' | 'check' | 'call' | 'raise', amount?: number) => {
    const { currentTable } = get();
    if (!currentTable) return;
    try {
      const roomId = currentTable.id || (currentTable as any).roomId || currentTable.name;
      let url = `/api/game/${action}?roomId=${roomId}`;
      if (action === 'raise' && amount) url += `&amount=${amount}`;
      await apiClient.post(url);

    } catch (e: any) {
      if (e.response?.status === 400) {
        get().addToast(translateError(e, 'Недостаточно средств для ставки'), 'error');
      } else {
        get().addToast(translateError(e, 'Ошибка выполнения действия'), 'error');
      }
    }
  },
  connectSSE: (roomId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const oldSSE = (window as any).currentGameSSE;
    if (oldSSE) {
      oldSSE.close();
    }
    const eventSource = new EventSource(`${API_URL}/api/game/stream/${roomId}?token=${token}`);
    (window as any).currentGameSSE = eventSource;
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = JSON.parse(event.data);
        if (typeof data === 'string') {
          try { data = JSON.parse(data); } catch (e) {}
        }
        if (Array.isArray(data) && data.length > 0) {
          data = data[0];
        }
        let newSeatIndex = get().mySeatIndex;
        if (data.seats) {
          const { nickname } = get();
          const foundSeat = Object.entries(data.seats).find(([_, name]) => name === nickname);
          if (foundSeat) {
            newSeatIndex = parseInt(foundSeat[0]);
          } else {
            newSeatIndex = null;
          }
        }
        let newIsReady = get().isReady;
        if (data.status === 'FINISHED') {
          newIsReady = false;
        }
        const updates: Partial<PokerUIState> = { 
          currentTable: data, 
          mySeatIndex: newSeatIndex, 
          isReady: newIsReady 
        };
        if (data.viewerBalance !== undefined) {
          updates.balance = data.viewerBalance;
          updates.profile = { ...get().profile, balance: data.viewerBalance };
        }
        set(updates);
      } catch (e) {
        console.error("SSE parse error", e);
      }
    };
    eventSource.addEventListener('INIT', handleMessage);
    eventSource.addEventListener('UPDATE', handleMessage);
    eventSource.onmessage = handleMessage;
    eventSource.onerror = () => {
      console.error("SSE Error");
    };
  },
  addToast: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  removeToast: (id: string) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  }
}));
if (typeof window !== 'undefined') {
  (window as any).useStore = useStore;
  useStore.getState().initSettings();
}