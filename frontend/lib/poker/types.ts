export interface HandResult {
  handId: string
  stackSettings: number[]
  positions: {
    dealer: number
    smallBlind: number
    bigBlind: number
  }
  holeCards: { [playerId: number]: string }
  actionSequence: string
  winnings: { [playerId: number]: number }
  timestamp: Date
}

export interface GameAction {
  playerId: number
  action: string
  amount?: number
  phase: string
}
