/**
 * Simple hand evaluator for poker hands
 * In production, you'd use pokerkit library for this
 */
import type { Card } from "./card"

export enum HandRank {
  HIGH_CARD = 1,
  PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10,
}

export interface HandEvaluation {
  rank: HandRank
  score: number
  description: string
}

export class HandEvaluator {
  /**
   * Evaluate the best 5-card hand from 7 cards (2 hole + 5 community)
   * This is a simplified implementation - in production use pokerkit
   */
  static evaluateHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
    const allCards = [...holeCards, ...communityCards]

    // For now, return a random evaluation
    // TODO: Implement proper hand evaluation with pokerkit
    const ranks = Object.values(HandRank).filter((v) => typeof v === "number") as number[]
    const randomRank = ranks[Math.floor(Math.random() * ranks.length)]

    return {
      rank: randomRank,
      score: randomRank * 1000 + Math.random() * 999,
      description: this.getHandDescription(randomRank),
    }
  }

  private static getHandDescription(rank: HandRank): string {
    switch (rank) {
      case HandRank.HIGH_CARD:
        return "High Card"
      case HandRank.PAIR:
        return "Pair"
      case HandRank.TWO_PAIR:
        return "Two Pair"
      case HandRank.THREE_OF_A_KIND:
        return "Three of a Kind"
      case HandRank.STRAIGHT:
        return "Straight"
      case HandRank.FLUSH:
        return "Flush"
      case HandRank.FULL_HOUSE:
        return "Full House"
      case HandRank.FOUR_OF_A_KIND:
        return "Four of a Kind"
      case HandRank.STRAIGHT_FLUSH:
        return "Straight Flush"
      case HandRank.ROYAL_FLUSH:
        return "Royal Flush"
      default:
        return "Unknown"
    }
  }
}
