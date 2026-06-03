import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStore } from './useStore';
import { apiClient } from '@/lib/api';
import { fetchPublicKey, encryptData } from '@/lib/crypto';
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  API_URL: 'http://test',
}));
vi.mock('@/lib/crypto', () => ({
  fetchPublicKey: vi.fn(),
  encryptData: vi.fn(),
}));
describe('useStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useStore.setState({
      isLoggedIn: false,
      nickname: '',
      balance: 5000,
      profile: { settings: {} },
      lobbies: [],
      currentTable: null,
      isLoadingTable: false,
      mySeatIndex: null,
      isReady: false,
      toasts: [],
      playerBalances: {},
    });
  });
  describe('auth', () => {
    it('login with username and password', async () => {
      vi.mocked(fetchPublicKey).mockResolvedValue('mock-key' as any);
      vi.mocked(encryptData).mockResolvedValue('encrypted');
      vi.mocked(apiClient.post).mockResolvedValue({ data: 'mock-token', headers: {} });
      vi.mocked(apiClient.get).mockResolvedValue({ data: { balance: 1000 } });
      await useStore.getState().login('testuser', 'testpass');
      expect(localStorage.getItem('token')).toBe('mock-token');
      expect(localStorage.getItem('nickname')).toBe('testuser');
      expect(useStore.getState().isLoggedIn).toBe(true);
      expect(useStore.getState().nickname).toBe('testuser');
      expect(useStore.getState().balance).toBe(1000);
      expect(useStore.getState().toasts[0].message).toContain('testuser');
    });
    it('login with json token', async () => {
      vi.mocked(fetchPublicKey).mockResolvedValue('mock-key' as any);
      vi.mocked(encryptData).mockResolvedValue('encrypted');
      vi.mocked(apiClient.post).mockResolvedValue({ data: { jwt: 'json-token' }, headers: {} });
      vi.mocked(apiClient.get).mockResolvedValue({ data: { balance: 1000 } });
      await useStore.getState().login('testuser', 'testpass');
      expect(localStorage.getItem('token')).toBe('json-token');
    });
    it('login with header token', async () => {
      vi.mocked(fetchPublicKey).mockResolvedValue('mock-key' as any);
      vi.mocked(encryptData).mockResolvedValue('encrypted');
      vi.mocked(apiClient.post).mockResolvedValue({ data: {}, headers: { authorization: 'Bearer header-token' } });
      vi.mocked(apiClient.get).mockResolvedValue({ data: { balance: 1000 } });
      await useStore.getState().login('testuser', 'testpass');
      expect(localStorage.getItem('token')).toBe('header-token');
    });
    it('login with missing token handles gracefully', async () => {
      vi.mocked(fetchPublicKey).mockResolvedValue('mock-key' as any);
      vi.mocked(encryptData).mockResolvedValue('encrypted');
      vi.mocked(apiClient.post).mockResolvedValue({ data: {}, headers: {} });
      vi.mocked(apiClient.get).mockResolvedValue({ data: { balance: 1000 } });
      localStorage.removeItem('token');
      await useStore.getState().login('testuser', 'testpass');
      expect(localStorage.getItem('token')).toBeNull();
    });
    it('login failure', async () => {
      vi.mocked(fetchPublicKey).mockResolvedValue('mock-key' as any);
      vi.mocked(encryptData).mockResolvedValue('encrypted');
      vi.mocked(apiClient.post).mockRejectedValue(new Error('fail'));
      await expect(useStore.getState().login('testuser', 'testpass')).rejects.toThrow();
      expect(useStore.getState().toasts[0].type).toBe('error');
    });
    it('logout', async () => {
      localStorage.setItem('token', 'mock');
      localStorage.setItem('nickname', 'testuser');
      vi.mocked(apiClient.post).mockResolvedValue({});
      await useStore.getState().logout();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('nickname')).toBeNull();
      expect(useStore.getState().isLoggedIn).toBe(false);
      expect(useStore.getState().nickname).toBe('');
      expect(useStore.getState().toasts[0].message).toBe('Вы вышли из аккаунта');
    });
  });
  describe('lobbies', () => {
    it('fetchLobbies success', async () => {
      const mockLobbies = [{ id: '1', name: 'lobby1' }];
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockLobbies });
      await useStore.getState().fetchLobbies();
      expect(useStore.getState().lobbies).toEqual(mockLobbies);
    });
    it('createLobby success', async () => {
      const mockLobby = { id: '1', name: 'New Lobby' };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockLobby }); 
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockLobby }); 
      global.EventSource = class EventSourceMock {
        addEventListener = vi.fn();
        close = vi.fn();
      } as any;
      await useStore.getState().createLobby('New Lobby', false, 6, 'NL10', 30);
      expect(useStore.getState().lobbies[0]).toEqual(mockLobby);
      expect(useStore.getState().toasts[0].message).toContain('New Lobby');
    });
    it('createLobby failure - 409', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 409 } });
      await useStore.getState().createLobby('New Lobby', false, 6, 'NL10', 30);
      expect(useStore.getState().toasts[0].message).toBe('Имя лобби уже занято');
    });
    it('createLobby failure - 400', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 400 } });
      await useStore.getState().createLobby('New Lobby', false, 6, 'NL10', 30);
      expect(useStore.getState().toasts[0].message).toBe('Некорректное имя лобби');
    });
  });
  it('connectSSE handles messages', async () => {
    let messageHandler: any;
    global.EventSource = class EventSourceMock {
      addEventListener = (event: string, handler: any) => {
        if (event === 'INIT' || event === 'UPDATE') {
          messageHandler = handler;
        }
      };
      close = vi.fn();
    } as any;
    localStorage.setItem('token', 't');
    useStore.getState().connectSSE('room1');

    await import('@testing-library/react').then(({ waitFor }) => waitFor(() => expect(messageHandler).toBeDefined()));
    if (messageHandler) {
      useStore.setState({ nickname: 'testuser', mySeatIndex: null, isReady: true });
      messageHandler({
        data: JSON.stringify({
          seats: { '2': 'testuser' },
          status: 'PLAYING',
          viewerBalance: 1200
        })
      });
      expect(useStore.getState().mySeatIndex).toBe(2);
      expect(useStore.getState().balance).toBe(1200);

      messageHandler({
        data: JSON.stringify({
          status: 'FINISHED',
        })
      });
      expect(useStore.getState().isReady).toBe(false);

      messageHandler({ data: 'invalid json' });
    }
  });
  describe('table actions', () => {
    beforeEach(() => {
       global.EventSource = class EventSourceMock {
        addEventListener = vi.fn();
        close = vi.fn();
      } as any;
    });
    it('joinTable success', async () => {
      const mockTable = { id: 'room1', name: 'room1', viewerBalance: 500 };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockTable });
      localStorage.setItem('token', 't');
      await useStore.getState().joinTable('room1');
      expect(useStore.getState().currentTable).toEqual(mockTable);
      expect(useStore.getState().balance).toBe(500);
      expect(useStore.getState().isLoadingTable).toBe(false);
    });
    it('joinTable failure - 404', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 404 } });
      await useStore.getState().joinTable('room1');
      expect(useStore.getState().toasts[0].message).toBe('Комната не найдена');
    });
    it('joinTable failure - 403', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 403 } });
      await useStore.getState().joinTable('room1');
      expect(useStore.getState().toasts[0].message).toBe('Неверный пароль');
    });
    it('joinTable failure - 401', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 401 } });
      await useStore.getState().joinTable('room1');
      expect(useStore.getState().toasts[0].message).toBe('Вы не авторизованы');
    });
    it('joinTable failure - 400', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 400 } });
      await useStore.getState().joinTable('room1');
      expect(useStore.getState().toasts[0].message).toBe('Некорректный запрос');
    });
    it('joinTable failure - 409 in progress', async () => {
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 409, data: 'in progress' } });
      await useStore.getState().joinTable('room1');
      expect(useStore.getState().toasts[0].message).toBe('Игра уже идёт');
    });
    it('takeSeat success', async () => {
      useStore.setState({ currentTable: { id: '1', name: 'table1' } as any });
      vi.mocked(apiClient.post).mockResolvedValue({});
      await useStore.getState().takeSeat(2);
      expect(useStore.getState().mySeatIndex).toBe(2);
      expect(apiClient.post).toHaveBeenCalledWith('/api/lobby/seat?roomId=1&seatNumber=2');
    });
    it('takeSeat without currentTable', async () => {
      useStore.setState({ currentTable: null });
      vi.mocked(apiClient.post).mockClear();
      await useStore.getState().takeSeat(2);
      expect(apiClient.post).not.toHaveBeenCalled();
    });
    it('takeSeat failure - 409 in progress', async () => {
      useStore.setState({ currentTable: { id: '1', name: 'table1' } as any });
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 409, data: 'in progress' } });
      await useStore.getState().takeSeat(2);
      expect(useStore.getState().toasts[0].message).toBe('Игра уже идёт');
    });
    it('takeSeat failure - 409 occupied', async () => {
      useStore.setState({ currentTable: { id: '1', name: 'table1' } as any });
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 409, data: 'seat already taken' } });
      await useStore.getState().takeSeat(2);
      expect(useStore.getState().toasts[0].message).toBe('Место уже занято');
    });
    it('takeSeat failure - 400', async () => {
      useStore.setState({ currentTable: { id: '1', name: 'table1' } as any });
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 400 } });
      await useStore.getState().takeSeat(2);
      expect(useStore.getState().toasts[0].message).toBe('Неверный номер места');
    });
    it('takeSeat failure - other', async () => {
      useStore.setState({ currentTable: { id: '1', name: 'table1' } as any });
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 500 } });
      await useStore.getState().takeSeat(2);
      expect(useStore.getState().toasts[0].message).toBe('Ошибка при посадке за стол');
    });
    it('toggleReady success', async () => {
      useStore.setState({ 
        currentTable: { id: '1', name: 'table1' } as any,
        mySeatIndex: 2,
        isReady: false
      });
      vi.mocked(apiClient.post).mockResolvedValue({});
      await useStore.getState().toggleReady();
      expect(useStore.getState().isReady).toBe(true);
      expect(apiClient.post).toHaveBeenCalledWith('/api/lobby/ready?roomId=1&ready=true');
    });
    it('toggleReady failure', async () => {
      useStore.setState({ 
        currentTable: { id: '1', name: 'table1' } as any,
        mySeatIndex: 2,
        isReady: false
      });
      vi.mocked(apiClient.post).mockRejectedValue(new Error('fail'));
      await useStore.getState().toggleReady();
      expect(useStore.getState().toasts[0].message).toBe('Ошибка смены статуса');
    });
    it('toggleReady without currentTable or seat', async () => {
      useStore.setState({ currentTable: null, mySeatIndex: null });
      vi.mocked(apiClient.post).mockClear();
      await useStore.getState().toggleReady();
      expect(apiClient.post).not.toHaveBeenCalled();
    });
    it('gameAction success', async () => {
      useStore.setState({ currentTable: { id: '1', name: 'table1' } as any });
      vi.mocked(apiClient.post).mockResolvedValue({});
      await useStore.getState().gameAction('raise', 100);
      expect(apiClient.post).toHaveBeenCalledWith('/api/game/raise?roomId=1&amount=100');
    });
    it('gameAction without currentTable', async () => {
      useStore.setState({ currentTable: null });
      vi.mocked(apiClient.post).mockClear();
      await useStore.getState().gameAction('call');
      expect(apiClient.post).not.toHaveBeenCalled();
    });
    it('gameAction failure - 400', async () => {
      useStore.setState({ currentTable: { id: '1', name: 'table1' } as any });
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 400 } });
      await useStore.getState().gameAction('raise', 100);
      expect(useStore.getState().toasts[0].message).toBe('Недостаточно средств для ставки');
    });
    it('gameAction failure - other error', async () => {
      useStore.setState({ currentTable: { id: '1', name: 'table1' } as any });
      vi.mocked(apiClient.post).mockRejectedValue({ response: { status: 500 } });
      await useStore.getState().gameAction('raise', 100);
      expect(useStore.getState().toasts[0].message).toBe('Ошибка выполнения действия');
    });
    it('leaveTable', async () => {
      useStore.setState({ 
        currentTable: { id: '1', name: 'table1' } as any,
        mySeatIndex: 2,
        isReady: true
      });
      vi.mocked(apiClient.post).mockResolvedValue({});
      const closeSpy = vi.fn();
      (window as any).currentGameSSE = { close: closeSpy };
      await useStore.getState().leaveTable();
      expect(useStore.getState().currentTable).toBeNull();
      expect(useStore.getState().mySeatIndex).toBeNull();
      expect(closeSpy).toHaveBeenCalled();
    });
    it('leaveTable without currentTable', async () => {
      useStore.setState({ currentTable: null });
      vi.mocked(apiClient.post).mockClear();
      await useStore.getState().leaveTable();
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });
  describe('settings & profiles', () => {
    it('handles missing poker_settings and invalid json', () => {
      localStorage.clear();
      expect(() => useStore.getState().initSettings()).not.toThrow();
      localStorage.setItem('poker_settings', 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      useStore.getState().initSettings();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
    it('restores auth from localStorage', () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('nickname', 'saved-user');
      useStore.getState().initSettings();
      expect(useStore.getState().isLoggedIn).toBe(true);
      expect(useStore.getState().nickname).toBe('saved-user');
    });
    it('updateSettings', () => {
      useStore.getState().updateSettings({ cardBack: 'red' });
      expect(useStore.getState().profile.settings.cardBack).toBe('red');
      expect(localStorage.getItem('poker_settings')).toContain('"cardBack":"red"');
    });
    it('updateProfile success', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: { username: 'newname' } });
      await useStore.getState().updateProfile('newname');
      expect(useStore.getState().nickname).toBe('newname');
      expect(useStore.getState().profile.username).toBe('newname');
    });
    it('fetchBalance success', async () => {
      useStore.setState({ nickname: 'test' });
      vi.mocked(apiClient.get).mockResolvedValue({ data: { balance: 999 } });
      await useStore.getState().fetchBalance();
      expect(useStore.getState().balance).toBe(999);
    });
    it('fetchPlayerBalance success', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: { balance: 500 } });
      await useStore.getState().fetchPlayerBalance('otherUser');
      expect(useStore.getState().playerBalances['otherUser']).toBe(500);

      await useStore.getState().fetchPlayerBalance('otherUser');
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      await useStore.getState().fetchPlayerBalance('otherUser', true);
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });
  describe('toasts', () => {
    it('addToast and removeToast', () => {
      vi.useFakeTimers();
      useStore.getState().addToast('test msg');
      expect(useStore.getState().toasts.length).toBe(1);
      vi.advanceTimersByTime(3000);
      expect(useStore.getState().toasts.length).toBe(0);
      vi.useRealTimers();
    });
  });
  describe('error translation', () => {
    it('translates various backend errors', async () => {
      const { createLobby } = useStore.getState();
      const testError = async (message: string, expectedTranslation: string, status = 400) => {
        vi.mocked(apiClient.post).mockRejectedValueOnce({ response: { status, data: { message } } });
        await createLobby('test', false, 6, 'NL10', 30000);
        const toasts = useStore.getState().toasts;
        const lastToast = toasts[toasts.length - 1];
        expect(lastToast.message).toBe(expectedTranslation);
      };
      await testError('Not authenticated', 'Необходима авторизация', 401);
      await testError('Invalid access', 'Неверный логин или пароль', 401);
      await testError('Forbidden', 'Доступ запрещен', 403);
      await testError('Invalid password', 'Неверный пароль', 403);
      await testError('Admin access required', 'Требуются права администратора', 403);
      await testError('Room not found', 'Комната не найдена', 404);
      await testError('Room not found with name: 123', 'Комната не найдена', 404);
      await testError('User not found', 'Пользователь не найден', 404);
      await testError('Room with this name already exists', 'Комната с таким именем уже существует', 409);
      await testError('Cannot join a room while the game is in progress', 'Невозможно войти: игра уже идёт', 409);
      await testError('Room is full', 'Комната заполнена', 409);
      await testError('Cannot change seats while the game is in progress', 'Нельзя сменить место во время игры', 409);
      await testError('Seat is already taken', 'Место уже занято', 409);
      await testError('Cannot change ready status while the game is in progress', 'Нельзя изменить готовность во время игры', 409);
      await testError('Username already exists', 'Имя пользователя уже занято', 409);
      await testError('Round transition in progress', 'Подождите, идет переход раунда', 409);
      await testError('Game is not in progress', 'Игра еще не началась', 409);
      await testError('Username cannot be empty', 'Имя пользователя не может быть пустым');
      await testError('Username contains invalid characters', 'Имя пользователя содержит недопустимые символы');
      await testError('Username must be 3-24 characters: letters, numbers, _ or -', 'Имя пользователя должно быть от 3 до 24 символов');
      await testError('Password cannot be empty', 'Пароль не может быть пустым');
      await testError('Password must be 6-128 characters', 'Пароль должен быть от 6 до 128 символов');
      await testError('Password contains invalid characters', 'Пароль содержит недопустимые символы');
      await testError('Password is too long', 'Пароль слишком длинный');
      await testError('Email contains invalid characters', 'Email содержит недопустимые символы');
      await testError('Invalid email format', 'Неверный формат Email');
      await testError('Encrypted value is required', 'Требуются зашифрованные данные');
      await testError('Invalid encrypted payload encoding', 'Неверная кодировка данных');
      await testError('Failed to decrypt credentials', 'Ошибка расшифровки данных');
      await testError('Invalid token', 'Недействительный токен');
      await testError('Avatar image is too large (max ~1.5 MB)', 'Размер аватара превышает лимит (1.5 МБ)');
      await testError('Invalid avatar data URL', 'Неверный формат аватара');
      await testError('Avatar must be JPEG, PNG, WebP or GIF', 'Аватар должен быть в формате JPEG, PNG, WebP или GIF');
      await testError('Avatar is not valid base64', 'Аватар не является валидной base64 строкой');
      await testError('Room name cannot be empty', 'Имя лобби не может быть пустым');
      await testError('Room name cannot exceed 24 characters', 'Имя лобби не может превышать 24 символа');
      await testError('Room name contains invalid characters', 'Имя лобби содержит недопустимые символы');
      await testError('You must join the room first', 'Вы должны сначала войти в комнату');
      await testError('Invalid seat number', 'Неверный номер места');
      await testError('Not enough seated players to start', 'Недостаточно игроков для старта');
      await testError('Not your turn', 'Сейчас не ваш ход');
      await testError('Cannot raise, all other players are all-in', 'Нельзя повысить: остальные игроки в олл-ине');
      await testError('Cannot raise more than your balance', 'Нельзя поставить больше, чем есть на балансе');
      await testError('Raise must be higher than current bet', 'Рейз должен быть выше текущей ставки');
      await testError('Cannot check, must call or fold', 'Нельзя чекнуть, нужно коллировать или сбросить (fold)');
      await testError('Insufficient funds', 'Недостаточно средств');
      await testError('Insufficient funds or wallet error for user: test', 'Недостаточно средств или ошибка кошелька');
      await testError('Unknown Error 123', 'Unknown Error 123');

      vi.mocked(apiClient.post).mockRejectedValueOnce({ response: { status: 400, data: JSON.stringify({ message: 'Invalid token' }) } });
      await createLobby('test', false, 6, 'NL10', 30000);
      const toasts = useStore.getState().toasts;
      expect(toasts[toasts.length - 1].message).toBe('Недействительный токен');
    });
  });
});