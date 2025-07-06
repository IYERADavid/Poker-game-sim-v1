import type { HandResult } from "./types"

const API_BASE_URL = "http://localhost:8000/api/v1"

export interface BackendHandData {
  stack_settings: number[]
  positions: {
    dealer: number
    small_blind: number
    big_blind: number
  }
  hole_cards: { [key: string]: string }
  action_sequence: string
  winnings: { [key: string]: number }
}

export interface BackendHandResponse {
  hand_id: string
  message: string
  data: any
}

export class PokerAPI {
  /**
   * Save a completed hand to the backend
   */
  static async saveHand(hand: HandResult): Promise<BackendHandResponse> {
    try {
      console.log("🔄 Saving hand to backend:", hand.handId.substring(0, 8))
      

      const payload: BackendHandData = {
        stack_settings: hand.stackSettings,
        positions: {
          dealer: hand.positions.dealer,
          small_blind: hand.positions.smallBlind,
          big_blind: hand.positions.bigBlind,
        },
        hole_cards: Object.fromEntries(Object.entries(hand.holeCards).map(([k, v]) => [k, v])),
        action_sequence: hand.actionSequence,
        winnings: Object.fromEntries(Object.entries(hand.winnings).map(([k, v]) => [k, v])),
      }

      const response = await fetch(`${API_BASE_URL}/hands/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Backend error: ${errorData.detail || response.statusText}`)
      }

      const result = await response.json()
      console.log("✅ Hand saved successfully:", result.hand_id)
      return result
    } catch (error) {
      console.error("❌ Error saving hand to backend:", error)
      throw error
    }
  }

  /**
   * Get all hands from the backend
   */
  static async getAllHands(): Promise<any[]> {
    try {
      console.log("🔄 Fetching hands from backend...")

      const response = await fetch(`${API_BASE_URL}/hands/`)

      if (!response.ok) {
        throw new Error(`Failed to fetch hands: ${response.statusText}`)
      }

      const hands = await response.json()
      console.log(`✅ Fetched ${hands.length} hands from backend`)
      return hands
    } catch (error) {
      console.error("❌ Error fetching hands:", error)
      throw error
    }
  }

  /**
   * Get a specific hand by ID
   */
  static async getHand(handId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/hands/${handId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch hand: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("❌ Error fetching hand:", error)
      throw error
    }
  }

  /**
   * Delete a hand
   */
  static async deleteHand(handId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/hands/${handId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete hand: ${response.statusText}`)
      }

      console.log("✅ Hand deleted successfully")
    } catch (error) {
      console.error("❌ Error deleting hand:", error)
      throw error
    }
  }
}
