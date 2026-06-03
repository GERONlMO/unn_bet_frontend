import { test, expect, describe } from 'vitest';
import { evaluateHand } from './pokerEvaluator';
import { CardData } from '../components/Card';
describe('Poker Hand Evaluator', () => {
  const createCard = (value: number, suit: string): CardData => ({ value, suit });
  test('should correctly identify a Royal Flush', () => {
    const holeCards = [createCard(14, 'Spades'), createCard(13, 'Spades')];
    const community = [
      createCard(12, 'Spades'), 
      createCard(11, 'Spades'), 
      createCard(10, 'Spades'), 
      createCard(2, 'Hearts'), 
      createCard(3, 'Diamonds')
    ];
    expect(evaluateHand(holeCards, community)).toBe('Royal Flush');
  });
  test('should correctly identify a Straight Flush', () => {
    const holeCards = [createCard(9, 'Hearts'), createCard(8, 'Hearts')];
    const community = [
      createCard(7, 'Hearts'), 
      createCard(6, 'Hearts'), 
      createCard(5, 'Hearts'), 
      createCard(14, 'Spades'), 
      createCard(2, 'Clubs')
    ];
    expect(evaluateHand(holeCards, community)).toBe('Straight Flush');
  });
  test('should correctly identify a low Straight Flush (A-2-3-4-5)', () => {
    const holeCards = [createCard(14, 'Diamonds'), createCard(2, 'Diamonds')];
    const community = [
      createCard(3, 'Diamonds'), 
      createCard(4, 'Diamonds'), 
      createCard(5, 'Diamonds'), 
      createCard(9, 'Spades'), 
      createCard(10, 'Clubs')
    ];
    expect(evaluateHand(holeCards, community)).toBe('Straight Flush');
  });
  test('should correctly identify Four of a Kind', () => {
    const holeCards = [createCard(8, 'Hearts'), createCard(8, 'Spades')];
    const community = [
      createCard(8, 'Diamonds'), 
      createCard(8, 'Clubs'), 
      createCard(2, 'Hearts'), 
      createCard(14, 'Spades'), 
      createCard(3, 'Clubs')
    ];
    expect(evaluateHand(holeCards, community)).toBe('Four of a Kind');
  });
  test('should correctly identify Full House', () => {
    const holeCards = [createCard(10, 'Hearts'), createCard(10, 'Spades')];
    const community = [
      createCard(10, 'Diamonds'), 
      createCard(4, 'Clubs'), 
      createCard(4, 'Hearts'), 
      createCard(14, 'Spades'), 
      createCard(3, 'Clubs')
    ];
    expect(evaluateHand(holeCards, community)).toBe('Full House');
  });
  test('should correctly identify Flush', () => {
    const holeCards = [createCard(2, 'Clubs'), createCard(5, 'Clubs')];
    const community = [
      createCard(9, 'Clubs'), 
      createCard(11, 'Clubs'), 
      createCard(13, 'Clubs'), 
      createCard(14, 'Spades'), 
      createCard(3, 'Hearts')
    ];
    expect(evaluateHand(holeCards, community)).toBe('Flush');
  });
  test('should correctly identify Straight', () => {
    const holeCards = [createCard(7, 'Hearts'), createCard(8, 'Spades')];
    const community = [
      createCard(9, 'Diamonds'), 
      createCard(10, 'Clubs'), 
      createCard(11, 'Hearts'), 
      createCard(14, 'Spades'), 
      createCard(3, 'Clubs')
    ];
    expect(evaluateHand(holeCards, community)).toBe('Straight');
  });
  test('should correctly identify Three of a Kind', () => {
    const holeCards = [createCard(7, 'Hearts'), createCard(7, 'Spades')];
    const community = [
      createCard(7, 'Diamonds'), 
      createCard(10, 'Clubs'), 
      createCard(2, 'Hearts'), 
      createCard(14, 'Spades'), 
      createCard(3, 'Clubs')
    ];
    expect(evaluateHand(holeCards, community)).toBe('Three of a Kind');
  });
  test('should correctly identify Two Pair', () => {
    const holeCards = [createCard(7, 'Hearts'), createCard(7, 'Spades')];
    const community = [
      createCard(9, 'Diamonds'), 
      createCard(9, 'Clubs'), 
      createCard(2, 'Hearts'), 
      createCard(14, 'Spades'), 
      createCard(3, 'Clubs')
    ];
    expect(evaluateHand(holeCards, community)).toBe('Two Pair');
  });
  test('should correctly identify Pair', () => {
    const holeCards = [createCard(7, 'Hearts'), createCard(14, 'Spades')];
    const community = [
      createCard(7, 'Diamonds'), 
      createCard(10, 'Clubs'), 
      createCard(2, 'Hearts'), 
      createCard(5, 'Spades'), 
      createCard(3, 'Clubs')
    ];
    expect(evaluateHand(holeCards, community)).toBe('Pair');
  });
  test('should correctly identify High Card', () => {
    const holeCards = [createCard(7, 'Hearts'), createCard(14, 'Spades')];
    const community = [
      createCard(9, 'Diamonds'), 
      createCard(10, 'Clubs'), 
      createCard(2, 'Hearts'), 
      createCard(5, 'Spades'), 
      createCard(3, 'Clubs')
    ];
    expect(evaluateHand(holeCards, community)).toBe('High Card');
  });
  test('should handle empty or invalid cards', () => {
    expect(evaluateHand([], [])).toBe('High Card');
    expect(evaluateHand([createCard(-1, 'empty')], [])).toBe('High Card');
    // @ts-ignore
    expect(evaluateHand(null, null)).toBe('High Card');
  });
  test('should handle straight without Ace', () => {
    const holeCards = [createCard(7, 'Hearts'), createCard(8, 'Spades')];
    const community = [
      createCard(9, 'Diamonds'), 
      createCard(10, 'Clubs'), 
      createCard(11, 'Hearts'), 
      createCard(2, 'Spades'), 
      createCard(3, 'Clubs')
    ];
    expect(evaluateHand(holeCards, community)).toBe('Straight');
  });
});