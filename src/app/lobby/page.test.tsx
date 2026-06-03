import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LobbyPage from './page';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));
vi.mock('@/components/Table', () => ({ Table: () => <div data-testid="table" /> }));
vi.mock('@/components/ui/Modal', () => ({ 
  Modal: ({ isOpen, children }: any) => isOpen ? <div data-testid="modal">{children}</div> : null 
}));
describe('LobbyPage', () => {
  const mockPush = vi.fn();
  const mockCreateLobby = vi.fn();
  const mockJoinTable = vi.fn();
  const mockFetchLobbies = vi.fn();
  const mockFetchBalance = vi.fn();
  const mockLogout = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useStore as any).mockReturnValue({
      isLoggedIn: true,
      isInitialized: true,
      nickname: 'testuser',
      balance: 1000,
      lobbies: [
        { id: '1', name: 'Lobby 1', maxPlayers: 6, players: [], limit: 'NL10', turnTimeLimit: 30000, isPrivate: false },
        { id: '2', name: 'Lobby 2', maxPlayers: 2, players: [], limit: 'NL100', turnTimeLimit: 15000, isPrivate: true },
      ],
      currentTable: null,
      createLobby: mockCreateLobby,
      joinTable: mockJoinTable,
      fetchLobbies: mockFetchLobbies,
      fetchBalance: mockFetchBalance,
      logout: mockLogout
    });
  });
  it('redirects if not logged in', () => {
    (useStore as any).mockReturnValue({ isInitialized: true, isLoggedIn: false });
    render(<LobbyPage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
  it('renders lobbies and filters', () => {
    render(<LobbyPage />);
    expect(screen.getByText('Lobby 1')).toBeInTheDocument();
    expect(screen.getByText('Lobby 2')).toBeInTheDocument();
  });
  it('filters lobbies by search', () => {
    render(<LobbyPage />);
    const searchInput = screen.getByPlaceholderText('Поиск лобби...');
    fireEvent.change(searchInput, { target: { value: 'Lobby 1' } });
    expect(screen.getByText('Lobby 1')).toBeInTheDocument();
    expect(screen.queryByText('Lobby 2')).not.toBeInTheDocument();
  });
  it('filters lobbies by limit', () => {
    render(<LobbyPage />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'NL100' } });
    expect(screen.queryByText('Lobby 1')).not.toBeInTheDocument();
    expect(screen.getByText('Lobby 2')).toBeInTheDocument();
  });
  it('opens create modal and creates lobby', async () => {
    render(<LobbyPage />);
    fireEvent.click(screen.getByText('Создать лобби'));
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText('Например, Вечерний покер');
    fireEvent.change(nameInput, { target: { value: 'My New Lobby' } });
    const createBtn = screen.getByText('Создать');
    fireEvent.click(createBtn);
    expect(mockCreateLobby).toHaveBeenCalledWith('My New Lobby', false, 6, 'NL10', 30000);
    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });
  it('renders table view if currentTable is set', () => {
    (useStore as any).mockReturnValue({
      isLoggedIn: true,
      isInitialized: true,
      currentTable: { id: '1' },
      fetchLobbies: mockFetchLobbies,
      fetchBalance: mockFetchBalance,
      profile: { settings: { background: 'classic' } }
    });
    render(<LobbyPage />);
    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.queryByText('Создать лобби')).not.toBeInTheDocument();
  });
  it('logs out', () => {
    render(<LobbyPage />);
    fireEvent.click(screen.getByText('Выйти'));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
  it('joins lobby', () => {
    render(<LobbyPage />);
    const joinBtns = screen.getAllByText('Присоединиться');
    fireEvent.click(joinBtns[0]);
    expect(mockJoinTable).toHaveBeenCalledWith('Lobby 1');
  });
});