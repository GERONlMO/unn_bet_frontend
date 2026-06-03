import { describe, it, expect } from 'vitest';
import { getBackgroundClass, generateEmptyTable, MOCK_TABLES, MOCK_LOBBIES, DEFAULT_PROFILE_SETTINGS } from './mockGameState';
describe('mockGameState', () => {
  describe('getBackgroundClass', () => {
    it('returns correct class for neon', () => {
      expect(getBackgroundClass('neon')).toBe('theme-neon');
    });
    it('returns correct class for dark', () => {
      expect(getBackgroundClass('dark')).toBe('bg-black');
    });
    it('returns correct class for none', () => {
      expect(getBackgroundClass('none')).toBe('bg-zinc-950');
    });
    it('returns correct class for casino', () => {
      expect(getBackgroundClass('casino')).toBe('theme-casino');
    });
    it('returns correct class for matrix', () => {
      expect(getBackgroundClass('matrix')).toBe('theme-matrix');
    });
    it('returns correct class for ocean', () => {
      expect(getBackgroundClass('ocean')).toBe('theme-ocean');
    });
    it('returns correct class for lava', () => {
      expect(getBackgroundClass('lava')).toBe('theme-lava');
    });
    it('returns correct class for classic/default', () => {
      expect(getBackgroundClass('classic')).toBe('bg-zinc-900');
      // @ts-ignore
      expect(getBackgroundClass('unknown')).toBe('bg-zinc-900');
    });
  });
  describe('generateEmptyTable', () => {
    it('generates an empty table correctly', () => {
      const table = generateEmptyTable('test-id', 'Test Table', 4);
      expect(table.id).toBe('test-id');
      expect(table.name).toBe('Test Table');
      expect(table.maxPlayers).toBe(4);
      expect(table.players.length).toBe(6);
      expect(table.players.every(p => p === null)).toBe(true);
      expect(table.pot).toBe(0);
      expect(table.communityCards).toEqual([]);
      expect(table.myCards).toEqual([]);
    });
  });
  describe('Constants', () => {
    it('exports MOCK_LOBBIES', () => {
      expect(MOCK_LOBBIES.length).toBeGreaterThan(0);
    });
    it('exports DEFAULT_PROFILE_SETTINGS', () => {
      expect(DEFAULT_PROFILE_SETTINGS).toBeDefined();
      expect(DEFAULT_PROFILE_SETTINGS.background).toBe('classic');
    });
    it('exports MOCK_TABLES', () => {
      expect(MOCK_TABLES['lobby-1']).toBeDefined();
    });
  });
});