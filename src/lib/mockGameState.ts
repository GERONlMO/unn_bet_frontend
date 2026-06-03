export interface MockPlayer {
  id: string;
  name: string;
  stack: number;
  currentBet: number;
  isActive: boolean;
  avatarColor?: string;
  avatar?: string;
  profile?: any;
  status: 'waiting' | 'thinking' | 'folded' | 'active' | 'ready' | 'not_ready';
  seatIndex?: number;
  cards?: any[];
}
export interface MockLobby {
  id: string;
  name: string;
  isPrivate: boolean;
  playersCount: number;
  maxPlayers: number;
  limit: string;
  turnTimeLimit?: number;
  players?: any[];
}
export interface MockTableState {
  id: string;
  name: string;
  limit: string;
  players: (MockPlayer | null)[]; 
  communityCards: string[];
  pot: number;
  currentTurnPlayerId: string;
  myCards: string[];
  maxPlayers: number;
  turnStartTime?: number;
  turnTimeLimit?: number;
  playerBalances?: Record<string, number>;
  status?: string;
  winner?: string | string[];
  winningCombination?: string;
  winAmount?: number;
  prize?: number;
  viewerBalance?: number;
  minBet?: number;
  currentHighestBet?: number;
  playerStates?: Record<string, any>;
  currentTurn?: string;
  tableDeck?: { cards?: any[] };
  seats?: Record<string, string>;
  readyPlayers?: string[];
  readyStatus?: string[] | Record<string, boolean>;
  playerProfiles?: Record<string, any>;
}
export const MOCK_LOBBIES: MockLobby[] = [
  { id: "lobby-1", name: "Новички NL10", isPrivate: false, playersCount: 3, maxPlayers: 6, limit: "NL10" },
  { id: "lobby-2", name: "Pro Club", isPrivate: true, playersCount: 5, maxPlayers: 6, limit: "NL100" },
  { id: "lobby-3", name: "Вечерний турик", isPrivate: false, playersCount: 2, maxPlayers: 4, limit: "NL50" },
  { id: "lobby-4", name: "Только свои", isPrivate: true, playersCount: 1, maxPlayers: 2, limit: "NL10" },
];
export interface ProfileSettings {
  background: 'classic' | 'neon' | 'dark' | 'none' | 'casino' | 'matrix' | 'ocean' | 'lava';
  cardBack: 'blue' | 'red' | 'gold' | 'minimal';
  cardFront: 'classic' | 'four-color' | 'dark' | 'vintage';
}
export const getBackgroundClass = (bg: ProfileSettings['background']) => {
  switch(bg) {
    case 'neon': return "theme-neon";
    case 'dark': return "bg-black";
    case 'none': return "bg-zinc-950";
    case 'casino': return "theme-casino";
    case 'matrix': return "theme-matrix";
    case 'ocean': return "theme-ocean";
    case 'lava': return "theme-lava";
    case 'classic': 
    default: return "bg-zinc-900";
  }
}
export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  background: 'classic',
  cardBack: 'blue',
  cardFront: 'classic'
};

export const generateEmptyTable = (id: string, name: string, maxPlayers: number): MockTableState => {
  return {
    id,
    name,
    limit: "NL10",
    maxPlayers,
    pot: 0,
    currentTurnPlayerId: "",
    communityCards: [],
    myCards: [],
    players: Array(6).fill(null)
  };
};
export const MOCK_TABLES: Record<string, MockTableState> = {
  "lobby-1": {
    ...generateEmptyTable("lobby-1", "Новички NL10", 6),
    players: [
      null,
      { id: "bot-1", name: "Alex", stack: 1000, currentBet: 0, isActive: true, avatarColor: "bg-red-500", status: 'ready', seatIndex: 1 },
      null,
      { id: "bot-2", name: "Maria", stack: 1500, currentBet: 0, isActive: true, avatarColor: "bg-green-500", status: 'not_ready', seatIndex: 3 },
      { id: "bot-3", name: "John", stack: 800, currentBet: 0, isActive: true, avatarColor: "bg-yellow-500", status: 'ready', seatIndex: 4 },
      null
    ]
  }
};
