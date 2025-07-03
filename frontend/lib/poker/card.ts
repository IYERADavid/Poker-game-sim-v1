export enum Suit {
  HEARTS = "h",
  DIAMONDS = "d",
  CLUBS = "c",
  SPADES = "s",
}

export enum Rank {
  TWO = "2",
  THREE = "3",
  FOUR = "4",
  FIVE = "5",
  SIX = "6",
  SEVEN = "7",
  EIGHT = "8",
  NINE = "9",
  TEN = "T",
  JACK = "J",
  QUEEN = "Q",
  KING = "K",
  ACE = "A",
}

export class Card {
  constructor(
    public rank: Rank,
    public suit: Suit,
  ) {}

  toString(): string {
    return `${this.rank}${this.suit}`
  }

  static fromString(cardStr: string): Card {
    if (cardStr.length !== 2) {
      throw new Error(`Invalid card string: ${cardStr}`)
    }
    const rank = cardStr[0] as Rank
    const suit = cardStr[1] as Suit
    return new Card(rank, suit)
  }
}

export class Deck {
  private cards: Card[] = []

  constructor() {
    this.reset()
  }

  reset(): void {
    this.cards = []
    for (const suit of Object.values(Suit)) {
      for (const rank of Object.values(Rank)) {
        this.cards.push(new Card(rank, suit))
      }
    }
    this.shuffle()
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]
    }
  }

  deal(): Card {
    const card = this.cards.pop()
    if (!card) {
      throw new Error("Cannot deal from empty deck")
    }
    return card
  }

  get remainingCards(): number {
    return this.cards.length
  }
}
