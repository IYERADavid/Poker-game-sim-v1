"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Minus, Plus, RotateCcw, Play, Users, TrendingUp, Clock, Shuffle, Target } from "lucide-react"
import { PokerGame as Game, GamePhase } from "@/lib/poker/game"
import { PlayerAction } from "@/lib/poker/player"
import type { HandResult } from "@/lib/poker/types"

/**
 * Main Poker Game Component with Debug Information
 */
const PokerGame = () => {
  // Game state
  const [game, setGame] = useState<Game>(new Game())
  const [gameState, setGameState] = useState(game.getGameState())
  const [validActions, setValidActions] = useState(game.getValidActions())

  // UI state
  const [betAmount, setBetAmount] = useState(40) // Default to big blind
  const [playerStacks, setPlayerStacks] = useState([1000, 1000, 1000, 1000, 1000, 1000])
  const [handHistory, setHandHistory] = useState<HandResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDebug, setShowDebug] = useState(true) // Show debug info by default

  const BIG_BLIND = 40

  /**
   * Update game state and valid actions
   */
  const updateGameState = useCallback(() => {
    const newState = game.getGameState()
    const newValidActions = game.getValidActions()

    setGameState(newState)
    setValidActions(newValidActions)

    // Debug logging
    console.log("=== GAME STATE UPDATE ===")
    console.log("Phase:", newState.phase)
    console.log("Active Player:", newState.players[newState.activePlayerIndex]?.name)
    console.log("Valid Actions:", newValidActions)
    console.log("Current Bet:", newState.currentBet)
    console.log("Pot:", newState.pot)
    if (newState.debugInfo) {
      console.log("Debug Info:", newState.debugInfo)
    }
  }, [game])

  useEffect(() => {
    updateGameState()
  }, [updateGameState])

  /**
   * Reset the game to initial state
   */
  const handleReset = () => {
    const newGame = new Game()
    newGame.setPlayerStacks(playerStacks)
    setGame(newGame)
    updateGameState()
    console.log("Game reset with stacks:", playerStacks)
  }

  /**
   * Start a new hand or continue with current game
   */
  const handleStart = async () => {
    setIsProcessing(true)

    try {
      // If previous hand is finished, save it to history
      if (gameState.phase === GamePhase.FINISHED) {
        console.log("Saving completed hand to history...")
        const handResult = game.generateHandResult()
        setHandHistory((prev) => {
          const newHistory = [handResult, ...prev]
          console.log("Hand saved to history:", handResult)
          console.log("Total hands in history:", newHistory.length)
          return newHistory
        })
      }

      if (gameState.isFirstAction) {
        game.setPlayerStacks(playerStacks)
        console.log("Set player stacks:", playerStacks)
      }

      game.startNewHand()
      updateGameState()
      console.log("New hand started")
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Process a player action
   */
  const handleAction = async (action: PlayerAction, amount?: number) => {
    setIsProcessing(true)

    try {
      console.log(`Processing action: ${action}${amount ? ` (${amount})` : ""}`)
      const success = game.processAction(action, amount)

      if (success) {
        console.log("Action processed successfully")
        updateGameState()

        // Check if hand is now complete
        const newState = game.getGameState()
        if (newState.phase === GamePhase.FINISHED) {
          console.log("Hand completed! Saving to history...")
          const handResult = game.generateHandResult()
          setHandHistory((prev) => {
            const newHistory = [handResult, ...prev]
            console.log("Hand automatically saved:", handResult)
            return newHistory
          })
        }
      } else {
        console.log("Action failed - check game logs")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Adjust bet amount in big blind increments
   */
  const adjustBetAmount = (increment: boolean) => {
    if (increment) {
      setBetAmount((prev) => prev + BIG_BLIND)
    } else {
      setBetAmount((prev) => Math.max(BIG_BLIND, prev - BIG_BLIND))
    }
  }

  /**
   * Get player position badge
   */
  const getPlayerPosition = (index: number) => {
    if (index === gameState.dealerIndex) return "D"
    if (index === gameState.smallBlindIndex) return "SB"
    if (index === gameState.bigBlindIndex) return "BB"
    return ""
  }

  /**
   * Get phase display name
   */
  const getPhaseDisplay = () => {
    switch (gameState.phase) {
      case GamePhase.PREFLOP:
        return "Pre-Flop"
      case GamePhase.FLOP:
        return "Flop"
      case GamePhase.TURN:
        return "Turn"
      case GamePhase.RIVER:
        return "River"
      case GamePhase.SHOWDOWN:
        return "Showdown"
      case GamePhase.FINISHED:
        return "Hand Complete"
      default:
        return "Setup"
    }
  }

  /**
   * Format hand history for display
   */
  const formatHandHistory = (hand: HandResult) => {
    const lines = [
      `Hand: ${hand.handId.substring(0, 8)}...`,
      `Stacks: [${hand.stackSettings.join(", ")}] | D:P${hand.positions.dealer + 1} SB:P${hand.positions.smallBlind + 1} BB:P${hand.positions.bigBlind + 1}`,
      `Cards: ${Object.entries(hand.holeCards)
        .map(([id, cards]) => `P${Number.parseInt(id) + 1}:${cards}`)
        .join(" ")}`,
      `Actions: ${hand.actionSequence || "No actions"}`,
      `Results: ${Object.entries(hand.winnings)
        .map(([id, amount]) => `P${Number.parseInt(id) + 1}:${amount > 0 ? "+" : ""}${amount}`)
        .join(" ")}`,
    ]
    return lines
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {/* Left Column - Setup & Actions */}
      <div className="space-y-6">
        {/* Debug Toggle */}
        <Card className="border border-yellow-200 bg-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Debug Mode</Label>
              <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)} className="h-7">
                <Target className="h-3 w-3 mr-1" />
                {showDebug ? "Hide" : "Show"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        {showDebug && (
          <Card className="border border-yellow-300 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-800">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div>
                <strong>Phase:</strong> {gameState.phase}
              </div>
              <div>
                <strong>Active Player:</strong> {gameState.players[gameState.activePlayerIndex]?.name || "None"}
              </div>
              <div>
                <strong>Valid Actions:</strong> {validActions.join(", ") || "None"}
              </div>
              <div>
                <strong>Current Bet:</strong> {gameState.currentBet}
              </div>
              <div>
                <strong>Amount to Call:</strong>{" "}
                {gameState.currentBet - (gameState.players[gameState.activePlayerIndex]?.currentBet || 0)}
              </div>
              {gameState.debugInfo && (
                <>
                  <div>
                    <strong>Active Players:</strong> {gameState.debugInfo.activePlayers}
                  </div>
                  <div>
                    <strong>Players Acted:</strong> {gameState.debugInfo.playersActed}
                  </div>
                  <div>
                    <strong>Bets Matched:</strong> {gameState.debugInfo.betsMatched ? "Yes" : "No"}
                  </div>
                </>
              )}
              <div>
                <strong>Hand History Count:</strong> {handHistory.length}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Section */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Users className="h-5 w-5" />
              Game Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {playerStacks.map((stack, index) => (
                <div key={index} className="space-y-1">
                  <Label htmlFor={`player-${index}`} className="text-xs font-medium text-green-700">
                    Player {index + 1}
                  </Label>
                  <Input
                    id={`player-${index}`}
                    type="number"
                    value={stack}
                    onChange={(e) => {
                      const newStacks = [...playerStacks]
                      newStacks[index] = Number.parseInt(e.target.value) || 0
                      setPlayerStacks(newStacks)
                    }}
                    className="h-9 text-sm border-green-200 focus:border-green-400"
                    disabled={!gameState.isFirstAction && gameState.phase !== GamePhase.SETUP}
                    min="0"
                    step="40"
                  />
                </div>
              ))}
            </div>

            <Separator className="bg-green-200" />

            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
                disabled={isProcessing}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleStart} className="flex-1 bg-green-600 hover:bg-green-700" disabled={isProcessing}>
                <Play className="h-4 w-4 mr-2" />
                {gameState.isFirstAction ? "Start" : "New Hand"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions Section */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Target className="h-5 w-5" />
              Player Actions
            </CardTitle>
            {gameState.phase !== GamePhase.SETUP && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Clock className="h-4 w-4" />
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {getPhaseDisplay()}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {gameState.phase !== GamePhase.SETUP && gameState.phase !== GamePhase.FINISHED ? (
              <>
                {/* Game Info */}
                <div className="bg-blue-100 p-3 rounded-lg space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Active Player:</span>
                    <span className="text-blue-700 font-semibold">
                      {gameState.players[gameState.activePlayerIndex]?.name || "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Pot:</span>
                    <span className="text-green-600 font-semibold">{gameState.pot} chips</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Current Bet:</span>
                    <span className="text-orange-600 font-semibold">{gameState.currentBet} chips</span>
                  </div>
                  {gameState.currentBet > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium">To Call:</span>
                      <span className="text-red-600 font-semibold">
                        {gameState.currentBet - (gameState.players[gameState.activePlayerIndex]?.currentBet || 0)} chips
                      </span>
                    </div>
                  )}
                </div>

                <Separator className="bg-blue-200" />

                {/* Basic Actions */}
                <div className="grid grid-cols-2 gap-2">
                  {validActions.includes(PlayerAction.FOLD) && (
                    <Button
                      onClick={() => handleAction(PlayerAction.FOLD)}
                      variant="destructive"
                      size="sm"
                      disabled={isProcessing}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Fold
                    </Button>
                  )}
                  {validActions.includes(PlayerAction.CHECK) && (
                    <Button
                      onClick={() => handleAction(PlayerAction.CHECK)}
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      className="border-gray-300 hover:bg-gray-100"
                    >
                      Check
                    </Button>
                  )}
                  {validActions.includes(PlayerAction.CALL) && (
                    <Button
                      onClick={() => handleAction(PlayerAction.CALL)}
                      variant="secondary"
                      size="sm"
                      disabled={isProcessing}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Call {gameState.currentBet - (gameState.players[gameState.activePlayerIndex]?.currentBet || 0)}
                    </Button>
                  )}
                  {validActions.includes(PlayerAction.ALL_IN) && (
                    <Button
                      onClick={() => handleAction(PlayerAction.ALL_IN)}
                      variant="destructive"
                      size="sm"
                      disabled={isProcessing}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      All-in
                    </Button>
                  )}
                </div>

                {/* Bet/Raise Actions */}
                {(validActions.includes(PlayerAction.BET) || validActions.includes(PlayerAction.RAISE)) && (
                  <div className="space-y-3 bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => adjustBetAmount(false)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-orange-300"
                        disabled={betAmount <= BIG_BLIND}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 text-center">
                        <div className="font-mono text-lg font-bold text-orange-700">{betAmount}</div>
                        <div className="text-xs text-orange-600">chips</div>
                      </div>
                      <Button
                        onClick={() => adjustBetAmount(true)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-orange-300"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {validActions.includes(PlayerAction.BET) && (
                        <Button
                          onClick={() => handleAction(PlayerAction.BET, betAmount)}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                          size="sm"
                          disabled={isProcessing}
                        >
                          Bet {betAmount}
                        </Button>
                      )}
                      {validActions.includes(PlayerAction.RAISE) && (
                        <Button
                          onClick={() => handleAction(PlayerAction.RAISE, betAmount)}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          size="sm"
                          disabled={isProcessing}
                        >
                          Raise to {betAmount}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-center text-blue-700">
                  {gameState.phase === GamePhase.SETUP
                    ? "Set player stacks and click Start to begin"
                    : gameState.phase === GamePhase.FINISHED
                      ? "Hand completed - click New Hand to continue"
                      : "Waiting for next action..."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle Column - Game State & Play Log */}
      <div className="space-y-6">
        {/* Game State */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Shuffle className="h-5 w-5" />
              Game State
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Community Cards */}
              {gameState.communityCards.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-purple-700">Community Cards</Label>
                  <div className="flex gap-2 mt-2 justify-center">
                    {gameState.communityCards.map((card, index) => (
                      <div
                        key={index}
                        className="bg-white border-2 border-purple-300 rounded-lg p-3 text-center font-mono text-lg font-bold min-w-[50px] shadow-md"
                      >
                        <span className={card.suit === "h" || card.suit === "d" ? "text-red-600" : "text-black"}>
                          {card.toString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Players Grid */}
              <div>
                <Label className="text-sm font-medium text-purple-700">Players</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {gameState.players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        index === gameState.activePlayerIndex &&
                        gameState.phase !== GamePhase.SETUP &&
                        gameState.phase !== GamePhase.FINISHED
                          ? "border-blue-400 bg-blue-100 shadow-md"
                          : "border-gray-200 bg-white"
                      } ${player.hasFolded ? "opacity-50 grayscale" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{player.name}</span>
                        <div className="flex gap-1">
                          {getPlayerPosition(index) && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {getPlayerPosition(index)}
                            </Badge>
                          )}
                          {player.hasFolded && (
                            <Badge variant="destructive" className="text-xs px-1 py-0">
                              Folded
                            </Badge>
                          )}
                          {player.isAllIn && (
                            <Badge variant="secondary" className="text-xs px-1 py-0 bg-purple-100">
                              All-in
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Stack:</span>
                          <span className="font-mono font-semibold">{player.stack}</span>
                        </div>
                        {player.currentBet > 0 && (
                          <div className="flex justify-between">
                            <span>Bet:</span>
                            <span className="font-mono font-semibold text-orange-600">{player.currentBet}</span>
                          </div>
                        )}
                      </div>

                      {player.holeCards.length > 0 && (
                        <div className="flex gap-1 mt-2 justify-center">
                          {player.holeCards.map((card, cardIndex) => (
                            <div
                              key={cardIndex}
                              className="bg-gray-100 border border-gray-300 rounded px-1.5 py-1 text-xs font-mono font-bold"
                            >
                              <span className={card.suit === "h" || card.suit === "d" ? "text-red-600" : "text-black"}>
                                {card.toString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Play Log */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Play Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {gameState.actionLog.length > 0 ? (
                  gameState.actionLog.map((action, index) => (
                    <div
                      key={index}
                      className={`text-sm font-mono p-2 rounded ${
                        action.includes("***")
                          ? "bg-blue-100 font-bold text-blue-800"
                          : action.includes("===")
                            ? "bg-green-100 font-bold text-green-800"
                            : action.includes("ERROR")
                              ? "bg-red-100 font-bold text-red-800"
                              : action.includes("DEBUG")
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-50"
                      }`}
                    >
                      {action}
                    </div>
                  ))
                ) : (
                  <Alert>
                    <AlertDescription className="text-center">
                      No actions yet - start a hand to see the play log
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Hand History */}
      <div>
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Clock className="h-5 w-5" />
              Hand History ({handHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {handHistory.length > 0 ? (
                <div className="space-y-4">
                  {handHistory.map((hand, index) => (
                    <div key={hand.handId} className="bg-white p-3 rounded-lg border border-amber-200 shadow-sm">
                      <div className="space-y-1">
                        {formatHandHistory(hand).map((line, lineIndex) => (
                          <div
                            key={lineIndex}
                            className={`text-xs font-mono ${
                              lineIndex === 0 ? "font-bold text-amber-700" : "text-gray-700"
                            }`}
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 text-right">{hand.timestamp.toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertDescription className="text-center text-amber-700">
                    <div className="space-y-2">
                      <p>Hand history will appear here</p>
                      <p className="text-xs">Complete hands are automatically saved</p>
                      <p className="text-xs font-mono">Play a full hand to see history!</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PokerGame
