import { CardData } from '@/components/Card';
export const evaluateHand = (holeCards: CardData[], communityCards: CardData[]): string => {
  const allCards = [...(holeCards || []), ...(communityCards || [])].filter(c => c && c.value !== -1 && c.suit !== 'empty');
  if (allCards.length < 2) return 'High Card';

  const valueCounts: Record<number, number> = {};
  const suitCounts: Record<string, number> = {};
  allCards.forEach(card => {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  const isFlush = Object.values(suitCounts).some(count => count >= 5);

  let isStraight = false;

  const uniqueValues = new Set(allCards.map(c => c.value));
  if (uniqueValues.has(14)) {
    uniqueValues.add(1); 
  }
  const sortedUniqueVals = Array.from(uniqueValues).sort((a, b) => b - a);
  for (let i = 0; i <= sortedUniqueVals.length - 5; i++) {
    if (sortedUniqueVals[i] - sortedUniqueVals[i + 4] === 4) {
      isStraight = true;
      break;
    }
  }

  let isStraightFlush = false;
  let isRoyalFlush = false;
  if (isFlush && isStraight) {
    for (const suit of Object.keys(suitCounts)) {
      if (suitCounts[suit] >= 5) {
        const suitValues = allCards.filter(c => c.suit === suit).map(c => c.value);
        const uniqueSuitVals = new Set(suitValues);
        if (uniqueSuitVals.has(14)) uniqueSuitVals.add(1);
        const sortedSuitVals = Array.from(uniqueSuitVals).sort((a, b) => b - a);
        for (let i = 0; i <= sortedSuitVals.length - 5; i++) {
          if (sortedSuitVals[i] - sortedSuitVals[i + 4] === 4) {
            isStraightFlush = true;
            if (sortedSuitVals[i] === 14) isRoyalFlush = true;
            break;
          }
        }
      }
    }
  }
  if (isRoyalFlush) return 'Royal Flush';
  if (isStraightFlush) return 'Straight Flush';
  if (counts[0] === 4) return 'Four of a Kind';
  if (counts[0] === 3 && counts[1] >= 2) return 'Full House';
  if (isFlush) return 'Flush';
  if (isStraight) return 'Straight';
  if (counts[0] === 3) return 'Three of a Kind';
  if (counts[0] === 2 && counts[1] === 2) return 'Two Pair';
  if (counts[0] === 2) return 'Pair';
  return 'High Card';
}