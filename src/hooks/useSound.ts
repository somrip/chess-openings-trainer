import { useCallback, useRef } from 'react'

export type SoundType = 'move' | 'capture' | 'check' | 'success' | 'error'

// Each sound is one or more short tones: [frequency(Hz), startOffset(s), duration(s)]
const TONES: Record<SoundType, Array<[number, number, number]>> = {
  move: [[220, 0, 0.07]],
  capture: [[140, 0, 0.09]],
  check: [[660, 0, 0.08], [880, 0.06, 0.1]],
  success: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.18]],
  error: [[180, 0, 0.12], [120, 0.08, 0.16]],
}

/**
 * Lightweight Web Audio sound effects — no asset files. The AudioContext is
 * created lazily on first play so it starts after a user gesture (browser policy).
 */
export function useSound(enabled = true) {
  const ctxRef = useRef<AudioContext | null>(null)

  const play = useCallback(
    (type: SoundType) => {
      if (!enabled) return
      try {
        if (!ctxRef.current) {
          const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          ctxRef.current = new AC()
        }
        const ctx = ctxRef.current
        if (ctx.state === 'suspended') void ctx.resume()

        for (const [freq, start, dur] of TONES[type]) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = type === 'capture' || type === 'error' ? 'triangle' : 'sine'
          osc.frequency.value = freq
          const t0 = ctx.currentTime + start
          gain.gain.setValueAtTime(0.0001, t0)
          gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.01)
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
          osc.connect(gain).connect(ctx.destination)
          osc.start(t0)
          osc.stop(t0 + dur + 0.02)
        }
      } catch {
        /* audio unavailable — ignore */
      }
    },
    [enabled],
  )

  return play
}
