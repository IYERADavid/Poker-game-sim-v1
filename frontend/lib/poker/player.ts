import type { Card } from "./card"

export enum PlayerAction {
  FOLD = "fold",
  CHECK = "check",
  CALL = "call",
  BET = "bet",
  RAISE = "raise",
  ALL_IN = "all_in",
}

export interface ActionData {
  action: PlayerAction
  amount?: number
  playerId: number
}

export class Player {
  public holeCards: Card[] = []
  public currentBet = 0
  public totalBetThisHand = 0
  public hasFolded = false
  public isAllIn = false
  public hasActed = false

  constructor(
    public id: number,
    public name: string,
    public stack: number,
  ) {}

  // Reset player for new hand
  reset(): void {
    this.holeCards = []
    this.currentBet = 0
    this.totalBetThisHand = 0
    this.hasFolded = false
    this.isAllIn = false
    this.hasActed = false
  }

  // Deal hole cards to player
  dealHoleCards(cards: Card[]): void {
    this.holeCards = cards
  }

  // Make a bet/raise
  bet(amount: number): number {
    const actualAmount = Math.min(amount, this.stack)
    this.stack -= actualAmount
    this.currentBet += actualAmount
    this.totalBetThisHand += actualAmount
    this.hasActed = true

    if (this.stack === 0) {
      this.isAllIn = true
    }

    return actualAmount
  }

  // Fold hand
  fold(): void {
    this.hasFolded = true
    this.hasActed = true
  }

  // Check (no bet)
  check(): void {
    this.hasActed = true
  }

  // Call current bet
  call(amountToCall: number): number {
    const actualAmount = Math.min(amountToCall, this.stack)
    return this.bet(actualAmount)
  }

  // Go all-in
  allIn(): number {
    const amount = this.stack
    this.bet(amount)
    return amount
  }

  // Can player act?
  canAct(): boolean {
    return !this.hasFolded && !this.isAllIn && this.stack > 0
  }

  // Get hole cards as string
  getHoleCardsString(): string {
    return this.holeCards.map((card) => card.toString()).join("")
  }
}
