import { createContext, useContext } from 'react'
import type { Opening } from '../types'

/**
 * App-level navigation handles, provided once at the root so the shared NavBar
 * (and its slide-out SideMenu) can navigate from any screen without threading
 * callbacks through every page.
 */
export interface NavContextValue {
  onSelectOpening: (o: Opening) => void
  onHome: () => void
  onStartReview: () => void
  currentOpeningId?: string
  dueCount: number
  streak: number
  isDue: (id: string) => boolean
  isLearned: (id: string) => boolean
}

export const NavContext = createContext<NavContextValue | null>(null)

export const useNav = () => useContext(NavContext)
