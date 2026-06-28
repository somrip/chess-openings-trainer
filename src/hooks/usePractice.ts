import { useState, useEffect, useCallback, useRef } from 'react'
import { Chess } from 'chess.js'
import type { Opening, PracticeStatus } from '../types'

interface UsePracticeReturn {
  fen: string
  status: PracticeStatus
  currentMoveIndex: number
  totalMoves: number
  repetitions: number
  isUserTurn: boolean
  makeMove: (from: string, to: string, promotion?: string) => boolean
  restart: () => void
}

export function usePractice(opening: Opening): UsePracticeReturn {
  const [game, setGame] = useState(() => new Chess())
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [status, setStatus] = useState<PracticeStatus>('waiting')
  const [repetitions, setRepetitions] = useState(0)
  const autoPlayRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalMoves = opening.moves.length

  const isUserTurn = useCallback(
    (index: number) => {
      if (opening.side === 'white') return index % 2 === 0
      return index % 2 === 1
    },
    [opening.side],
  )

  // Auto-play opponent moves
  useEffect(() => {
    if (status === 'complete' || status === 'wrong') return
    if (currentMoveIndex >= totalMoves) return
    if (isUserTurn(currentMoveIndex)) return

    setStatus('opponent')
    autoPlayRef.current = setTimeout(() => {
      setGame((prev) => {
        const next = new Chess(prev.fen())
        next.move(opening.moves[currentMoveIndex])
        return next
      })
      setCurrentMoveIndex((i) => i + 1)
      setStatus('waiting')
    }, 600)

    return () => {
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current)
    }
  }, [currentMoveIndex, status, totalMoves, opening.moves, isUserTurn])

  const makeMove = useCallback(
    (from: string, to: string, promotion = 'q'): boolean => {
      if (!isUserTurn(currentMoveIndex) || (status !== 'waiting' && status !== 'wrong')) return false
      if (currentMoveIndex >= totalMoves) return false

      const temp = new Chess(game.fen())
      const result = temp.move({ from, to, promotion })
      if (!result) return false

      const expected = opening.moves[currentMoveIndex]
      if (result.san !== expected) {
        setStatus('wrong')
        return false
      }

      setGame(temp)
      const nextIndex = currentMoveIndex + 1

      if (nextIndex >= totalMoves) {
        setRepetitions((r) => r + 1)
        setStatus('complete')
      } else {
        setCurrentMoveIndex(nextIndex)
        setStatus('waiting')
      }
      return true
    },
    [game, currentMoveIndex, status, totalMoves, opening.moves, isUserTurn],
  )

  const restart = useCallback(() => {
    if (autoPlayRef.current) clearTimeout(autoPlayRef.current)
    setGame(new Chess())
    setCurrentMoveIndex(0)
    setStatus('waiting')
  }, [])

  return {
    fen: game.fen(),
    status,
    currentMoveIndex,
    totalMoves,
    repetitions,
    isUserTurn: isUserTurn(currentMoveIndex),
    makeMove,
    restart,
  }
}
