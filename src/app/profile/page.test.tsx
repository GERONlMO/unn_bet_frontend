import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfilePage from './page';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));
describe('ProfilePage', () => {
  const mockUpdateProfile = vi.fn();
  const mockUpdateSettings = vi.fn();
  const mockPush = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useStore as any).mockReturnValue({
      isLoggedIn: true,
      isInitialized: true,
      profile: {
        nickname: 'testuser',
        balance: 5000,
        gamesPlayed: 10,
        wins: 3,
        maxWin: 1000,
        avatarColor: 'bg-red-500',
        settings: { background: 'classic', cardBack: 'blue', cardFront: 'classic' }
      },
      updateProfile: mockUpdateProfile,
      updateSettings: mockUpdateSettings
    });
  });
  it('redirects to login if not logged in', () => {
    (useStore as any).mockReturnValue({ isInitialized: true, isLoggedIn: false, profile: { nickname: '' } });
    render(<ProfilePage />);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
  it('renders profile stats', () => {
    render(<ProfilePage />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getAllByText(/5\s*[,.\u00A0]?\s*000/)[0]).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
  it('edits nickname', async () => {
    const { container } = render(<ProfilePage />);
    const editBtn = container.querySelectorAll('button')[0]; 
    fireEvent.click(editBtn!);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'newname' } });
    const saveBtn = container.querySelectorAll('button')[1]; 
    fireEvent.click(saveBtn!);
    expect(mockUpdateProfile).toHaveBeenCalledWith({ username: 'newname', avatar: undefined });
  });
  it('updates settings', () => {
    render(<ProfilePage />);
    fireEvent.click(screen.getByText('Неон'));
    expect(mockUpdateSettings).toHaveBeenCalledWith({ background: 'neon' });
    fireEvent.click(screen.getByText('Красная'));
    expect(mockUpdateSettings).toHaveBeenCalledWith({ cardBack: 'red' });
  });
  it('handles avatar file upload', async () => {
    const { container } = render(<ProfilePage />);
    const editBtn = container.querySelectorAll('button')[0]; 
    fireEvent.click(editBtn!);

    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });

    let readerInstance: any;
    global.FileReader = class {
      onload: any = null;
      result = 'data:image/png;base64,mockbase64';
      readAsDataURL = vi.fn(() => {
        readerInstance = this;
      });
    } as any;

    let imageInstance: any;
    global.Image = class {
      onload: any = null;
      src = '';
      width = 500;
      height = 300;
      constructor() {
        imageInstance = this;
      }
    } as any;
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [] } });

    fireEvent.change(input, { target: { files: [file] } });

    readerInstance.onload({ target: readerInstance } as any);

    const mockContext = {
      drawImage: vi.fn(),
    };
    const mockCanvas = {
      getContext: vi.fn(() => mockContext),
      toDataURL: vi.fn(() => 'data:image/jpeg;base64,resized'),
      width: 0,
      height: 0,
    };
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas as any;
      return originalCreateElement(tagName);
    });

    act(() => {
      imageInstance.onload();
    });

    const saveBtn = container.querySelectorAll('button')[1];
    fireEvent.click(saveBtn!);
    expect(mockUpdateProfile).toHaveBeenCalledWith({ username: 'testuser', avatar: 'data:image/jpeg;base64,resized' });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});