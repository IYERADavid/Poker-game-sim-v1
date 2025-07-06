import { type Card, Deck } from "./card"
import { Player, PlayerAction } from "./player"
import type { HandResult, GameAction } from "./types"
import { v4 as uuidv4 } from "uuid"

export enum GamePhase {
  SETUP = "setup",
  PREFLOP = "preflop",
  FLOP = "flop",
  TURN = "turn",
  RIVER = "river",
  SHOWDOWN = "showdown",
  FINISHED = "finished",
}

export interface GameState {
  phase: GamePhase
  players: Player[]
  communityCards: Card[]
  pot: number
  currentBet: number
  activePlayerIndex: number
  dealerIndex: number
  smallBlindIndex: number
  bigBlindIndex: number
  actionLog: string[]
  handId?: string
  isFirstAction: boolean
}

export class PokerGame {
  private deck: Deck
  private players: Player[] = []
  private communityCards: Card[] = []
  private pot = 0
  private currentBet = 0
  private activePlayerIndex = 0
  private dealerIndex = 0
  private smallBlindIndex = 0
  private bigBlindIndex = 0
  private phase: GamePhase = GamePhase.SETUP
  private actionLog: string[] = []
  private gameActions: GameAction[] = []
  private handId = ""
  private isFirstAction = true
  private initialStacks: number[] = []

  private readonly SMALL_BLIND = 20
  private readonly BIG_BLIND = 40

  constructor() {
    this.deck = new Deck()
    this.initializePlayers()
  }

  private initializePlayers(): void {
    for (let i = 0; i < 6; i++) {
      this.players.push(new Player(i, `Player ${i + 1}`, 1000))
    }
  }

  setPlayerStacks(stacks: number[]): void {
    if (stacks.length !== 6) {
      throw new Error("Must provide exactly 6 stack sizes")
    }

    this.initialStacks = [...stacks]
    for (let i = 0; i < 6; i++) {
      this.players[i].stack = stacks[i]
    }
  }

  startNewHand(): void {
    this.resetForNewHand()
    this.postBlinds()
    this.dealHoleCards()
    this.phase = GamePhase.PREFLOP
    this.setActivePlayer()

    this.logAction("=== NEW HAND STARTED ===")
    this.logAction(`Dealer: ${this.players[this.dealerIndex].name}`)
    this.logAction(`Small Blind: ${this.players[this.smallBlindIndex].name} posts ${this.SMALL_BLIND}`)
    this.logAction(`Big Blind: ${this.players[this.bigBlindIndex].name} posts ${this.BIG_BLIND}`)
    this.logAction(`*** PREFLOP *** - Action to ${this.players[this.activePlayerIndex].name}`)

    // Console log for debugging (not shown in UI)
    console.log(`[POKER] New hand started - Hand ID: ${this.handId}`)
    console.log(`[POKER] Active player: ${this.players[this.activePlayerIndex].name}`)
  }

  private resetForNewHand(): void {
    this.handId = uuidv4()
    this.deck.reset()
    this.communityCards = []
    this.pot = 0
    this.currentBet = 0
    this.actionLog = []
    this.gameActions = []
    this.phase = GamePhase.SETUP
    this.isFirstAction = true

    // Reset all players for new hand
    this.players.forEach((player) => player.reset())

    // Move dealer to next active player
    this.dealerIndex = this.findNextPlayerWithChips(this.dealerIndex)

    // Assign blinds to next two active players
    this.smallBlindIndex = this.findNextPlayerWithChips(this.dealerIndex)
    this.bigBlindIndex = this.findNextPlayerWithChips(this.smallBlindIndex)
  }

  private postBlinds(): void {
    // Small blind
    const sbAmount = this.players[this.smallBlindIndex].bet(this.SMALL_BLIND)
    this.pot += sbAmount

    // Big blind
    const bbAmount = this.players[this.bigBlindIndex].bet(this.BIG_BLIND)
    this.pot += bbAmount
    this.currentBet = this.BIG_BLIND
  }

  private dealHoleCards(): void {
    // Deal 2 cards to each player, starting left of dealer
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < 6; i++) {
        const playerIndex = (this.dealerIndex + 1 + i) % 6
        this.players[playerIndex].holeCards.push(this.deck.deal())
      }
    }
  }

  private setActivePlayer(): void {
    if (this.phase === GamePhase.PREFLOP) {
      // Preflop: action starts left of big blind (UTG)
      this.activePlayerIndex = (this.bigBlindIndex + 1) % 6
    } else {
      // Post-flop: action starts left of dealer (small blind position)
      this.activePlayerIndex = (this.dealerIndex + 1) % 6
    }

    this.findNextActivePlayer()
  }

  private findNextActivePlayer(): void {
    let attempts = 0
    const startIndex = this.activePlayerIndex

    while (attempts < 6) {
      const player = this.players[this.activePlayerIndex]

      if (player.canAct()) {
        console.log(`[POKER] Active player set to: ${player.name}`)
        return
      }

      this.activePlayerIndex = (this.activePlayerIndex + 1) % 6
      attempts++

      // Prevent infinite loop
      if (this.activePlayerIndex === startIndex && attempts > 0) {
        console.log(`[POKER] No active players found - checking hand completion`)
        break
      }
    }

    // If we get here, no one can act - hand should be complete
    console.log(`[POKER] No active players found after ${attempts} attempts`)
  }

  private findNextPlayerWithChips(fromIndex: number): number {
    const total = this.players.length
    let next = (fromIndex + 1) % total
    let attempts = 0
  
    while (this.players[next].stack === 0 && attempts < total) {
      next = (next + 1) % total
      attempts++
    }
  
    if (attempts >= total) {
      throw new Error("No players with chips remaining")
    }
  
    return next
  }  

  processAction(action: PlayerAction, amount?: number): boolean {
    const player = this.players[this.activePlayerIndex]

    if (!player || !player.canAct()) {
      console.log(`[POKER] ERROR: ${player?.name || "Unknown"} cannot act`)
      return false
    }

    // Mark that first action has been taken
    if (this.isFirstAction) {
      this.isFirstAction = false
    }

    let actionAmount = 0
    let actionDescription = ""
    let shortAction = ""

    const amountToCall = this.currentBet - player.currentBet

    switch (action) {
      case PlayerAction.FOLD:
        player.fold()
        actionDescription = `${player.name} folds`
        shortAction = "f"
        break

      case PlayerAction.CHECK:
        if (amountToCall > 0) {
          console.log(`[POKER] ERROR: ${player.name} cannot check - must call ${amountToCall}`)
          return false
        }
        player.check()
        actionDescription = `${player.name} checks`
        shortAction = "x"
        break

      case PlayerAction.CALL:
        if (amountToCall <= 0) {
          console.log(`[POKER] ERROR: ${player.name} cannot call - no bet to call`)
          return false
        }
        actionAmount = player.call(amountToCall)
        this.pot += actionAmount
        actionDescription = `${player.name} calls ${actionAmount}`
        shortAction = "c"
        break

      case PlayerAction.BET:
        if (this.currentBet > 0) {
          console.log(`[POKER] ERROR: ${player.name} cannot bet - current bet is ${this.currentBet}`)
          return false
        }
        if (!amount || amount < this.BIG_BLIND) {
          console.log(`[POKER] ERROR: Bet amount must be at least ${this.BIG_BLIND}`)
          return false
        }
        actionAmount = player.bet(amount)
        this.pot += actionAmount
        this.currentBet = player.currentBet
        actionDescription = `${player.name} bets ${actionAmount}`
        shortAction = `b${actionAmount}`
        break

      case PlayerAction.RAISE:
        if (this.currentBet === 0) {
          console.log(`[POKER] ERROR: ${player.name} cannot raise - no bet to raise`)
          return false
        }
        if (!amount || amount <= this.currentBet) {
          console.log(`[POKER] ERROR: Raise amount must be greater than current bet ${this.currentBet}`)
          return false
        }
        const totalRaiseAmount = amount - player.currentBet
        actionAmount = player.bet(totalRaiseAmount)
        this.pot += actionAmount
        this.currentBet = player.currentBet
        actionDescription = `${player.name} raises to ${player.currentBet}`
        shortAction = `r${player.currentBet}`
        break

      case PlayerAction.ALL_IN:
        actionAmount = player.allIn()
        this.pot += actionAmount
        if (player.currentBet > this.currentBet) {
          this.currentBet = player.currentBet
        }
        actionDescription = `${player.name} goes all-in for ${actionAmount}`
        shortAction = "allin"
        break

      default:
        console.log(`[POKER] ERROR: Unknown action ${action}`)
        return false
    }

    // Log the action
    this.logAction(actionDescription)

    // Store action for hand history
    this.gameActions.push({
      playerId: this.activePlayerIndex,
      action: shortAction,
      amount: actionAmount,
      phase: this.phase,
    })

    // Console log for debugging
    console.log(`[POKER] ${actionDescription} - Pot: ${this.pot}, Current bet: ${this.currentBet}`)

    // Move to next player
    this.moveToNextPlayer()

    // Check if betting round is complete
    if (this.isBettingRoundComplete()) {
      this.advanceToNextPhase()
    }

    return true
  }

  private moveToNextPlayer(): void {
    this.activePlayerIndex = (this.activePlayerIndex + 1) % 6
    this.findNextActivePlayer()
  }

  private isBettingRoundComplete(): boolean {
    const activePlayers = this.players.filter((p) => !p.hasFolded)

    console.log(`[POKER] Checking round completion - ${activePlayers.length} active players`)

    // If only one player left, hand is over
    if (activePlayers.length <= 1) {
      console.log(`[POKER] Only ${activePlayers.length} player(s) left - hand over`)
      return true
    }

    // Special case: if all remaining players are all-in except one
    const playersWithChips = activePlayers.filter((p) => p.stack > 0 && !p.isAllIn)
    if (playersWithChips.length <= 1) {
      console.log(`[POKER] All players all-in or only one with chips - round complete`)
      return true
    }

    // Check if all active players have acted and matched the current bet
    let allActed = true
    let allBetsMatched = true

    for (const player of activePlayers) {
      const hasActed = player.hasActed
      const betMatched = player.currentBet === this.currentBet || player.isAllIn || player.stack === 0

      if (!hasActed) allActed = false
      if (!betMatched) allBetsMatched = false

      console.log(`[POKER] ${player.name} - acted: ${hasActed}, bet matched: ${betMatched}`)
    }

    const roundComplete = allActed && allBetsMatched
    console.log(`[POKER] Round complete: ${roundComplete}`)

    return roundComplete
  }

  private advanceToNextPhase(): void {
    // Reset player actions for next round
    this.players.forEach((player) => {
      player.hasActed = false
      player.currentBet = 0
    })
    this.currentBet = 0

    const activePlayers = this.players.filter((p) => !p.hasFolded)

    // If only one player left, go straight to finish
    if (activePlayers.length <= 1) {
      this.phase = GamePhase.FINISHED
      this.processHandCompletion()
      return
    }

    switch (this.phase) {
      case GamePhase.PREFLOP:
        this.dealFlop()
        this.phase = GamePhase.FLOP
        break
      case GamePhase.FLOP:
        this.dealTurn()
        this.phase = GamePhase.TURN
        break
      case GamePhase.TURN:
        this.dealRiver()
        this.phase = GamePhase.RIVER
        break
      case GamePhase.RIVER:
        this.phase = GamePhase.SHOWDOWN
        this.processShowdown()
        return
    }

    this.setActivePlayer()
    this.logAction(`Action to ${this.players[this.activePlayerIndex].name}`)
  }

  private dealFlop(): void {
    this.deck.deal() // Burn card
    for (let i = 0; i < 3; i++) {
      this.communityCards.push(this.deck.deal())
    }
    const flopCards = this.communityCards
      .slice(0, 3)
      .map((c) => c.toString())
      .join(" ")
    this.logAction(`*** FLOP *** [${flopCards}]`)
    this.gameActions.push({
      playerId: -1,
      action: this.communityCards
        .slice(0, 3)
        .map((c) => c.toString())
        .join(""),
      phase: "flop",
    })
  }

  private dealTurn(): void {
    this.deck.deal() // Burn card
    this.communityCards.push(this.deck.deal())
    const turnCard = this.communityCards[3].toString()
    this.logAction(`*** TURN *** [${turnCard}]`)
    this.gameActions.push({
      playerId: -1,
      action: turnCard,
      phase: "turn",
    })
  }

  private dealRiver(): void {
    this.deck.deal() // Burn card
    this.communityCards.push(this.deck.deal())
    const riverCard = this.communityCards[4].toString()
    this.logAction(`*** RIVER *** [${riverCard}]`)
    this.gameActions.push({
      playerId: -1,
      action: riverCard,
      phase: "river",
    })
  }

  private processShowdown(): void {
    this.logAction("*** SHOWDOWN ***")
    this.processHandCompletion()
  }

  private processHandCompletion(): void {
    const activePlayers = this.players.filter((p) => !p.hasFolded)

    if (activePlayers.length === 1) {
      // Only one player left - they win
      const winner = activePlayers[0]
      winner.stack += this.pot
      this.logAction(`${winner.name} wins ${this.pot} (no showdown needed)`)
    } else {
      // Multiple players - evaluate hands
      const winner = activePlayers[0]
      winner.stack += this.pot
      this.logAction(`${winner.name} wins ${this.pot} with best hand`)
    }

    this.phase = GamePhase.FINISHED
    this.logAction("*** HAND COMPLETE ***")

    console.log(`[POKER] Hand ${this.handId} completed`)
  }

  private logAction(action: string): void {
    this.actionLog.push(action)
  }

  generateHandResult(): HandResult {
    const winnings: { [playerId: number]: number } = {}

    // Calculate winnings/losses compared to initial stacks
    for (let i = 0; i < 6; i++) {
      const initialStack = this.initialStacks[i] || 1000
      const finalStack = this.players[i].stack
      winnings[i] = finalStack - initialStack
    }

    // Generate action sequence string
    const actionSequence = this.gameActions.map((action) => action.action).join(" ")

    // Generate hole cards object
    const holeCards: { [playerId: number]: string } = {}
    for (let i = 0; i < 6; i++) {
      holeCards[i] = this.players[i].getHoleCardsString()
    }

    return {
      handId: this.handId,
      stackSettings: [...this.initialStacks],
      positions: {
        dealer: this.dealerIndex,
        smallBlind: this.smallBlindIndex,
        bigBlind: this.bigBlindIndex,
      },
      holeCards,
      actionSequence,
      winnings,
      timestamp: new Date(),
    }
  }

  getGameState(): GameState {
    return {
      phase: this.phase,
      players: [...this.players],
      communityCards: [...this.communityCards],
      pot: this.pot,
      currentBet: this.currentBet,
      activePlayerIndex: this.activePlayerIndex,
      dealerIndex: this.dealerIndex,
      smallBlindIndex: this.smallBlindIndex,
      bigBlindIndex: this.bigBlindIndex,
      actionLog: [...this.actionLog],
      handId: this.handId,
      isFirstAction: this.isFirstAction,
    }
  }

  getValidActions(): PlayerAction[] {
    const player = this.players[this.activePlayerIndex]

    if (!player || !player.canAct() || this.phase === GamePhase.FINISHED || this.phase === GamePhase.SETUP) {
      return []
    }

    const actions: PlayerAction[] = [PlayerAction.FOLD]
    const amountToCall = this.currentBet - player.currentBet

    if (amountToCall === 0) {
      // No bet to call - can check or bet
      actions.push(PlayerAction.CHECK)
      if (player.stack >= this.BIG_BLIND) {
        actions.push(PlayerAction.BET)
      }
    } else {
      // There's a bet to call
      if (player.stack >= amountToCall) {
        actions.push(PlayerAction.CALL)
      }
      if (player.stack > amountToCall && player.stack >= this.BIG_BLIND) {
        actions.push(PlayerAction.RAISE)
      }
    }

    // Can always go all-in if have chips
    if (player.stack > 0) {
      actions.push(PlayerAction.ALL_IN)
    }

    console.log(`[POKER] Valid actions for ${player.name}:`, actions)
    return actions
  }
}
