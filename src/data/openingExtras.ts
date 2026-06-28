import type { OpeningExtras } from '../types'

/**
 * Structure lessons and piece-placement guides, keyed by opening id.
 * Kept separate from openings.ts so the move data stays lean.
 *
 * Piece-guide squares are *ideal* placements (guidance), not necessarily the
 * exact squares reached in the demo line.
 */
export const openingExtras: Record<string, OpeningExtras> = {
  'italian-game': {
    structure: {
      name: 'Open centre, classical development',
      idea: 'Both sides develop quickly and the centre opens after c3 and d4. Your plan: castle, finish developing, and use your central pawns to launch a kingside attack — f7 stays the target.',
    },
    pieceGuide: [
      { square: 'c4', glyph: '♗', piece: 'Bishop', note: 'Eyes the weak f7 square — the heart of the Italian.' },
      { square: 'e1', glyph: '♖', piece: 'Rook', note: 'Belongs on the e-file, behind the e4 pawn.' },
      { square: 'g1', glyph: '♔', piece: 'King', note: 'Castle kingside early for safety.' },
    ],
  },
  'ruy-lopez': {
    structure: {
      name: 'Closed Ruy centre',
      idea: 'White slowly builds a big pawn centre with c3 and d4. Your plan: reroute the knight via d2–f1–g3 toward the kingside while keeping the strong Spanish bishop.',
    },
    pieceGuide: [
      { square: 'b3', glyph: '♗', piece: 'Bishop', note: 'After ...b5 it retreats to b3, eyeing f7 and d5.' },
      { square: 'e1', glyph: '♖', piece: 'Rook', note: 'Supports e4 and the coming d4 break.' },
      { square: 'g3', glyph: '♘', piece: 'Knight', note: 'Reroute b1–d2–f1–g3 to attack the kingside.' },
    ],
  },
  'queens-gambit': {
    structure: {
      name: 'Closed centre, fight for d5',
      idea: 'A classic struggle over the d5 square. Your plan: pressure d5, consider the minority attack with b4–b5 on the queenside, and use the half-open c-file.',
    },
    pieceGuide: [
      { square: 'g5', glyph: '♗', piece: 'Bishop', note: 'Pins the f6 knight, increasing pressure on d5.' },
      { square: 'c3', glyph: '♘', piece: 'Knight', note: 'A third attacker on the d5 square.' },
      { square: 'd3', glyph: '♗', piece: 'Bishop', note: 'The light bishop eyes the kingside from d3.' },
    ],
  },
  'london-system': {
    structure: {
      name: 'Pyramid pawn triangle (d4–e3–c3)',
      idea: 'A rock-solid, hard-to-attack setup that plays the same against almost anything. Your plan: castle, plant a knight on e5, and throw pieces at Black\'s king.',
    },
    pieceGuide: [
      { square: 'f4', glyph: '♗', piece: 'Bishop', note: 'The London bishop lives on f4, outside the pawn chain.' },
      { square: 'd3', glyph: '♗', piece: 'Bishop', note: 'Light bishop to d3, aiming at h7.' },
      { square: 'e5', glyph: '♘', piece: 'Knight', note: 'A knight on e5 is the London attacking dream.' },
    ],
  },
  'scotch-game': {
    structure: {
      name: 'Open game, symmetrical pawns',
      idea: 'The centre opens early and pieces fly out. Your plan: develop actively, castle, and target Black\'s doubled c-pawns as a long-term weakness.',
    },
    pieceGuide: [
      { square: 'd4', glyph: '♘', piece: 'Knight', note: 'The centralised knight is the Scotch hallmark.' },
      { square: 'c4', glyph: '♗', piece: 'Bishop', note: 'Active diagonal pointing at f7.' },
      { square: 'g1', glyph: '♔', piece: 'King', note: 'Castle to safety before the centre opens fully.' },
    ],
  },
  'caro-kann': {
    structure: {
      name: 'Solid structure, free light bishop',
      idea: 'A sound, slightly cramped but very healthy setup — crucially, your light bishop is active outside the pawn chain. Your plan: finish developing, castle, then break with ...c5 or ...e5.',
    },
    pieceGuide: [
      { square: 'f5', glyph: '♝', piece: 'Bishop', note: 'Get the light bishop OUT to f5 before playing ...e6.' },
      { square: 'd7', glyph: '♞', piece: 'Knight', note: 'Supports a later ...c5 or ...e5 break.' },
      { square: 'e7', glyph: '♝', piece: 'Bishop', note: 'Dark bishop to e7, then castle.' },
    ],
  },
  'french-defense': {
    structure: {
      name: 'Pawn chains (e6–d5 vs e5–d4)',
      idea: 'Locked pawn chains point at opposite wings. Your plan: attack the base of White\'s chain with ...c5 (and sometimes ...f6) for queenside and central counterplay.',
    },
    pieceGuide: [
      { square: 'c5', glyph: '♟', piece: 'Pawn', note: 'The ...c5 break hits the base of White\'s pawn chain.' },
      { square: 'c6', glyph: '♞', piece: 'Knight', note: 'Knight to c6 piles pressure on d4.' },
      { square: 'b6', glyph: '♛', piece: 'Queen', note: 'Queen to b6 adds a hit on d4 and eyes b2.' },
    ],
  },
  'sicilian-defense': {
    structure: {
      name: 'Half-open c-file, queenside majority',
      idea: 'Asymmetrical pawns give you a half-open c-file and queenside space. Your plan: expand with ...b5, fianchetto the bishop, and attack down the c-file toward White\'s king.',
    },
    pieceGuide: [
      { square: 'b7', glyph: '♝', piece: 'Bishop', note: 'After ...b5, the bishop rakes the long diagonal from b7.' },
      { square: 'e7', glyph: '♝', piece: 'Bishop', note: 'Dark bishop to e7, then castle.' },
      { square: 'c8', glyph: '♜', piece: 'Rook', note: 'Use the half-open c-file for queenside pressure.' },
    ],
  },
  scandinavian: {
    structure: {
      name: 'Open centre, clear development',
      idea: 'Simple and clear: you regain the pawn and develop fast. Your plan: castle, contest the d5 square and c-file, and aim your active queen and bishop at White\'s position.',
    },
    pieceGuide: [
      { square: 'a5', glyph: '♛', piece: 'Queen', note: 'The queen sits actively on a5, eyeing c3.' },
      { square: 'f5', glyph: '♝', piece: 'Bishop', note: 'Develop the bishop out to f5 (or g4) before ...e6.' },
      { square: 'c6', glyph: '♞', piece: 'Knight', note: 'Knight to c6 hits d4 and supports the centre.' },
    ],
  },
  'vienna-game': {
    structure: {
      name: 'Open game with an f4 break',
      idea: 'A flexible king\'s-pawn battle where White\'s trump is the f4 push. Your plan: develop, castle, then play f4 to open the f-file and attack toward f7.',
    },
    pieceGuide: [
      { square: 'c4', glyph: '♗', piece: 'Bishop', note: 'Targets the weak f7 square.' },
      { square: 'c3', glyph: '♘', piece: 'Knight', note: 'Developed first in the Vienna, supporting e4.' },
      { square: 'f4', glyph: '♙', piece: 'Pawn', note: 'The f4 break is the opening\'s main attacking idea.' },
    ],
  },
  'kings-gambit': {
    structure: {
      name: 'Open lines, half-open f-file',
      idea: 'You give a pawn for speed and attacking lines. Your plan: develop fast, castle, and pile down the half-open f-file at f7 before Black gets organised.',
    },
    pieceGuide: [
      { square: 'f3', glyph: '♘', piece: 'Knight', note: 'Develops and stops the annoying …Qh4+.' },
      { square: 'c4', glyph: '♗', piece: 'Bishop', note: 'Joins the attack on f7.' },
      { square: 'f1', glyph: '♖', piece: 'Rook', note: 'After castling, the rook attacks down the half-open f-file.' },
    ],
  },
  'slav-defense': {
    structure: {
      name: 'Solid d5 chain, free bishop',
      idea: 'You support d5 with …c6 but, crucially, keep the light bishop free (unlike the QGD). Your plan: develop the bishop to f5, castle, and break with …c5 or …e5.',
    },
    pieceGuide: [
      { square: 'f5', glyph: '♝', piece: 'Bishop', note: 'Get the light bishop OUT to f5 — the whole point of the Slav.' },
      { square: 'c6', glyph: '♟', piece: 'Pawn', note: 'Supports d5 without blocking the bishop.' },
      { square: 'e6', glyph: '♟', piece: 'Pawn', note: 'Played only after the bishop is outside, opening the dark bishop.' },
    ],
  },
}

export const getExtras = (id: string): OpeningExtras | undefined => openingExtras[id]
