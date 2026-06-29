import { useState, useEffect, useMemo, useRef } from 'react'
import { Chess } from 'chess.js'

/** Minimal shape the demo steps through — an opening or a variation line. */
interface DemoLine {
  id: string
  moves: string[]
}

/**
 * Steps through a move list one ply at a time. `initialIndex` lets the caller
 * resume mid-line (e.g. when branching into a variation at its fork point);
 * the demo resets to it whenever the line `id` changes.
 */
export function useDemo(line: DemoLine, initialIndex = 0) {
  const [moveIndex, setMoveIndex] = useState(initialIndex)
  const [playing, setPlaying] = useState(false)
  const initialRef = useRef(initialIndex)
  initialRef.current = initialIndex

  const fen = useMemo(() => {
    const g = new Chess()
    for (let i = 0; i < moveIndex; i++) {
      g.move(line.moves[i])
    }
    return g.fen()
  }, [moveIndex, line.moves])

  useEffect(() => {
    if (!playing) return
    if (moveIndex >= line.moves.length) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setMoveIndex((i) => i + 1), 900)
    return () => clearTimeout(t)
  }, [playing, moveIndex, line.moves.length])

  // Reset to the (possibly mid-line) start when the line changes.
  useEffect(() => {
    setMoveIndex(initialRef.current)
    setPlaying(false)
  }, [line.id])

  const isComplete = moveIndex >= line.moves.length

  return {
    fen,
    moveIndex,
    totalMoves: line.moves.length,
    playing,
    isComplete,
    play: () => {
      if (isComplete) setMoveIndex(0)
      setPlaying(true)
    },
    pause: () => setPlaying(false),
    reset: () => {
      setMoveIndex(initialRef.current)
      setPlaying(false)
    },
    prev: () => {
      setPlaying(false)
      setMoveIndex((i) => Math.max(0, i - 1))
    },
    next: () => {
      setPlaying(false)
      setMoveIndex((i) => Math.min(line.moves.length, i + 1))
    },
    goTo: (i: number) => {
      setPlaying(false)
      setMoveIndex(Math.max(0, Math.min(line.moves.length, i)))
    },
  }
}
