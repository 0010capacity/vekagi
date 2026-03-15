// src/stores/uiStore.ts
// UI 상태 관리

import { create } from 'zustand'
import type { UIState, PieceDefinition, Position, AnimationEntry } from '@/types/game'

interface UIStore extends UIState {
  setScreen: (screen: UIState['currentScreen']) => void
  openModal: (modal: UIState['modalOpen'], piece?: PieceDefinition) => void
  closeModal: () => void
  setHoveredCell: (pos: Position | null) => void
  setPreviewMoves: (moves: Position[]) => void
  setPreviewPushResult: (results: Map<string, number>) => void
  queueAnimation: (entry: AnimationEntry) => void
  shiftAnimation: () => AnimationEntry | undefined
  clearAnimationQueue: () => void
  setIsAnimating: (v: boolean) => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  currentScreen: 'main_menu',
  modalOpen: null,
  selectedPieceForModal: null,
  hoveredCell: null,
  previewMoves: [],
  previewPushResult: new Map(),
  animationQueue: [],
  isAnimating: false,

  setScreen: (screen) => set({ currentScreen: screen }),

  openModal: (modal, piece) => set({
    modalOpen: modal,
    selectedPieceForModal: piece ?? null
  }),

  closeModal: () => set({ modalOpen: null, selectedPieceForModal: null }),

  setHoveredCell: (pos) => set({ hoveredCell: pos }),

  setPreviewMoves: (moves) => set({ previewMoves: moves }),

  setPreviewPushResult: (results) => set({ previewPushResult: results }),

  queueAnimation: (entry) => set(s => ({
    animationQueue: [...s.animationQueue, entry]
  })),

  shiftAnimation: () => {
    const queue = get().animationQueue
    if (queue.length === 0) return undefined
    const [first, ...rest] = queue
    set({ animationQueue: rest })
    return first
  },

  clearAnimationQueue: () => set({ animationQueue: [] }),

  setIsAnimating: (v) => set({ isAnimating: v }),
}))
