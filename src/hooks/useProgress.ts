import { useState, useEffect, useCallback } from 'react'
import type { OpeningProgress, ProgressMap } from '../types'

const STORAGE_KEY = 'cot-progress-v1'

interface ProgressState {
  openings: ProgressMap
  streak: number
  lastActiveDay: string // YYYY-MM-DD
}

const EMPTY: ProgressState = { openings: {}, streak: 0, lastActiveDay: '' }

function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()
  return Math.round(ms / 86_400_000)
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    return { ...EMPTY, ...parsed }
  } catch {
    return EMPTY
  }
}

/**
 * Spaced-repetition scheduler (simplified SM-2). Each completion counts as a
 * successful recall, lengthening the interval before the opening is due again.
 */
function schedule(prev: OpeningProgress | undefined): OpeningProgress {
  const now = new Date()
  const ease = prev?.ease ?? 2.5
  const completions = (prev?.completions ?? 0) + 1

  let intervalDays: number
  if (completions === 1) intervalDays = 1
  else if (completions === 2) intervalDays = 3
  else intervalDays = Math.round((prev?.intervalDays ?? 3) * ease)

  const due = new Date(now)
  due.setDate(due.getDate() + intervalDays)

  return {
    completions,
    ease,
    intervalDays,
    lastPracticed: now.toISOString(),
    dueDate: due.toISOString(),
  }
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(EMPTY)

  // Hydrate from localStorage after mount (avoids SSR/first-paint mismatch)
  useEffect(() => {
    setState(load())
  }, [])

  // Persist on every change
  useEffect(() => {
    if (state === EMPTY) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full or unavailable — fail silently */
    }
  }, [state])

  const recordCompletion = useCallback((openingId: string) => {
    setState((prev) => {
      const today = todayKey()
      let streak = prev.streak
      if (prev.lastActiveDay !== today) {
        const gap = prev.lastActiveDay ? daysBetween(prev.lastActiveDay, today) : 0
        streak = gap === 1 ? prev.streak + 1 : 1
      }
      return {
        openings: { ...prev.openings, [openingId]: schedule(prev.openings[openingId]) },
        streak: Math.max(streak, 1),
        lastActiveDay: today,
      }
    })
  }, [])

  const getProgress = useCallback(
    (id: string): OpeningProgress | undefined => state.openings[id],
    [state.openings],
  )

  const isDue = useCallback(
    (id: string): boolean => {
      const p = state.openings[id]
      if (!p) return false
      return new Date(p.dueDate).getTime() <= Date.now()
    },
    [state.openings],
  )

  const learnedCount = Object.keys(state.openings).length
  const dueCount = Object.keys(state.openings).filter((id) => isDue(id)).length

  return {
    streak: state.streak,
    learnedCount,
    dueCount,
    getProgress,
    isDue,
    recordCompletion,
  }
}
