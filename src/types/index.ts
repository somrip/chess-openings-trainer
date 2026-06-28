export interface Opening {
  id: string
  name: string
  side: 'white' | 'black'
  description: string
  moves: string[]
  beginnerTips: string[]
  eco?: string
}

export type AppView = 'home' | 'opening' | 'practice'

export type PracticeStatus = 'idle' | 'waiting' | 'opponent' | 'wrong' | 'complete'
