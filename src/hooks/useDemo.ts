import { useState, useEffect, useMemo } from 'react'
import { Chess } from 'chess.js'
import type { Opening } from '../types'

export function useDemo(opening: Opening) {
  const [moveIndex, setMoveIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  const fen = useMemo(() => {
    const g = new Chess()
    for (let i = 0; i < moveIndex; i++) {
      g.move(opening.moves[i])
    }
    return g.fen()
  }, [moveIndex, opening.moves])

  useEffect(() => {
    if (!playing) return
    if (moveIndex >= opening.moves.length) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setMoveIndex((i) => i + 1), 900)
    return () => clearTimeout(t)
  }, [playing, moveIndex, opening.moves.length])

  // Reset when opening changes
  useEffect(() => {
    setMoveIndex(0)
    setPlaying(false)
  }, [opening.id])

  const isComplete = moveIndex >= opening.moves.length

  return {
    fen,
    moveIndex,
    totalMoves: opening.moves.length,
    playing,
    isComplete,
    play: () => {
      if (isComplete) setMoveIndex(0)
      setPlaying(true)
    },
    pause: () => setPlaying(false),
    reset: () => {
      setMoveIndex(0)
      setPlaying(false)
    },
    prev: () => {
      setPlaying(false)
      setMoveIndex((i) => Math.max(0, i - 1))
    },
    next: () => {
      setPlaying(false)
      setMoveIndex((i) => Math.min(opening.moves.length, i + 1))
    },
    goTo: (i: number) => {
      setPlaying(false)
      setMoveIndex(Math.max(0, Math.min(opening.moves.length, i)))
    },
  }
}
