import { useState, useEffect, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'
import type { Move } from 'chess.js'
import type { PracticeStatus } from '../types'
import { analyzeMistake } from '../lib/analyzeMistake'

export interface PracticeConfig {
  moves: string[]
  side: 'white' | 'black'
}

export interface PracticeEvents {
  onCorrect?: (move: Move) => void
  onWrong?: () => void
  onComplete?: () => void
  onOpponent?: (move: Move) => void
}

export interface HintSquares {
  from: string
  to: string
}

interface UsePracticeReturn {
  fen: string
  status: PracticeStatus
  currentMoveIndex: number
  totalMoves: number
  repetitions: number
  isUserTurn: boolean
  lastMove: HintSquares | null
  lastMistake: string | null
  makeMove: (from: string, to: string, promotion?: string) => boolean
  getHint: () => HintSquares | null
  restart: () => void
}

export function usePractice(config: PracticeConfig, events?: PracticeEvents): UsePracticeReturn {
  const { moves, side } = config
  const [game, setGame] = useState(() => new Chess())
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [status, setStatus] = useState<PracticeStatus>('waiting')
  const [repetitions, setRepetitions] = useState(0)
  const [lastMove, setLastMove] = useState<HintSquares | null>(null)
  const [lastMistake, setLastMistake] = useState<string | null>(null)
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep callbacks in a ref so the effect/handlers never go stale or re-subscribe.
  const eventsRef = useRef(events)
  eventsRef.current = events

  const totalMoves = moves.length

  const isUserTurn = useCallback(
    (index: number) => (side === 'white' ? index % 2 === 0 : index % 2 === 1),
    [side],
  )

  // Auto-play the opponent's moves.
  useEffect(() => {
    if (status === 'complete' || status === 'wrong') return
    if (currentMoveIndex >= totalMoves) return
    if (isUserTurn(currentMoveIndex)) return

    setStatus('opponent')
    autoPlayRef.current = setTimeout(() => {
      setGame((prev) => {
        const next = new Chess(prev.fen())
        const res = next.move(moves[currentMoveIndex])
        if (res) {
          setLastMove({ from: res.from, to: res.to })
          eventsRef.current?.onOpponent?.(res)
        }
        return next
      })
      const nextIndex = currentMoveIndex + 1
      setCurrentMoveIndex(nextIndex)
      // The line can end on the opponent's move — complete here too.
      if (nextIndex >= totalMoves) {
        setRepetitions((r) => r + 1)
        setStatus('complete')
        eventsRef.current?.onComplete?.()
      } else {
        setStatus('waiting')
      }
    }, 600)

    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current)
    }
  }, [currentMoveIndex, status, totalMoves, moves, isUserTurn])

  const makeMove = useCallback(
    (from: string, to: string, promotion = 'q'): boolean => {
      if (!isUserTurn(currentMoveIndex) || (status !== 'waiting' && status !== 'wrong')) return false
      if (currentMoveIndex >= totalMoves) return false

      const temp = new Chess(game.fen())
      let result: Move | null
      try {
        result = temp.move({ from, to, promotion })
      } catch {
        return false // illegal move shape — let the board snap the piece back
      }
      if (!result) return false

      if (result.san !== moves[currentMoveIndex]) {
        setStatus('wrong')
        setLastMistake(analyzeMistake(game.fen(), from, to, promotion))
        eventsRef.current?.onWrong?.()
        return false
      }

      setGame(temp)
      setLastMistake(null)
      setLastMove({ from: result.from, to: result.to })
      eventsRef.current?.onCorrect?.(result)
      const nextIndex = currentMoveIndex + 1

      if (nextIndex >= totalMoves) {
        setRepetitions((r) => r + 1)
        setStatus('complete')
        eventsRef.current?.onComplete?.()
      } else {
        setCurrentMoveIndex(nextIndex)
        setStatus('waiting')
      }
      return true
    },
    [game, currentMoveIndex, status, totalMoves, moves, isUserTurn],
  )

  // Resolve the expected move into board squares for the hint system.
  const getHint = useCallback((): HintSquares | null => {
    if (currentMoveIndex >= totalMoves || !isUserTurn(currentMoveIndex)) return null
    const probe = new Chess(game.fen())
    const expected = moves[currentMoveIndex]
    const match = probe.moves({ verbose: true }).find((m) => m.san === expected)
    return match ? { from: match.from, to: match.to } : null
  }, [game, currentMoveIndex, totalMoves, moves, isUserTurn])

  const restart = useCallback(() => {
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current)
    setGame(new Chess())
    setCurrentMoveIndex(0)
    setStatus('waiting')
    setLastMove(null)
    setLastMistake(null)
  }, [])

  return {
    fen: game.fen(),
    status,
    currentMoveIndex,
    totalMoves,
    repetitions,
    isUserTurn: isUserTurn(currentMoveIndex),
    lastMove,
    lastMistake,
    makeMove,
    getHint,
    restart,
  }
}
