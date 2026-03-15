// src/stores/runStore.ts
// 런 전체 상태 관리 (localStorage 저장)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RunState, PieceDefinition, Formation, Currencies } from '@/types/game'
import { generateRunMap } from '@/engine/mapGenerator'

interface RunStore extends RunState {
  startRun: (initialPieces: PieceDefinition[]) => void
  addPiece: (piece: PieceDefinition) => void
  removePiece: (pieceId: number) => void
  addFormation: (formation: Formation) => void
  setActiveFormation: (formation: Formation | null) => void
  damageCommander: (amount: number) => void
  healCommander: (amount: number) => void
  increaseMaxHP: (amount: number) => void
  addCurrency: (type: keyof Currencies, amount: number) => void
  spendCurrency: (type: keyof Currencies, amount: number) => boolean
  unlockPieceSlot: () => void
  advanceFloor: () => void
  completeCurrentNode: () => void
  recordDeath: (pieceId: number) => void
  endRun: (result: 'victory' | 'defeat') => void
  resetRun: () => void
  setCurrentNodeId: (nodeId: string) => void
  addTurns: (count: number) => void
  recordChainCollision: (chainLength: number) => void
  recordBossDefeat: () => void
}

const INITIAL_STATE: RunState = {
  commanderHP: 15,
  maxCommanderHP: 15,
  ownedPieces: [],
  ownedFormations: [],
  activeFormation: null,
  currentZone: 1,
  currentFloor: 1,
  currencies: { 전투결정: 0, 정예결정: 0, 공허파편: 0 },
  runMap: { nodes: [], currentNodeId: '' },
  pieceSlots: 3,
  defeatedPieces: [],
  isRunActive: false,
  runResult: null,
  stats: {
    totalTurns: 0,
    totalDeaths: 0,
    maxChainCollision: 0,
    floorsCleared: 0,
    bossesDefeated: 0,
  },
}

export const useRunStore = create<RunStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      startRun: (initialPieces) => set({
        ...INITIAL_STATE,
        ownedPieces: initialPieces,
        runMap: generateRunMap(),
        isRunActive: true,
        runResult: 'ongoing',
      }),

      addPiece: (piece) => set(s => ({ ownedPieces: [...s.ownedPieces, piece] })),

      removePiece: (pieceId) => set(s => ({
        ownedPieces: s.ownedPieces.filter(p => p.id !== pieceId)
      })),

      addFormation: (formation) => set(s => ({
        ownedFormations: [...s.ownedFormations, formation]
      })),

      setActiveFormation: (formation) => set({ activeFormation: formation }),

      damageCommander: (amount) => set(s => {
        const newHP = Math.max(0, s.commanderHP - amount)
        return {
          commanderHP: newHP,
          runResult: newHP === 0 ? 'defeat' : s.runResult,
          isRunActive: newHP > 0 ? s.isRunActive : false,
        }
      }),

      healCommander: (amount) => set(s => ({
        commanderHP: Math.min(s.maxCommanderHP, s.commanderHP + amount)
      })),

      increaseMaxHP: (amount) => set(s => ({
        maxCommanderHP: s.maxCommanderHP + amount,
        commanderHP: s.commanderHP + amount, // 증가분만큼 즉시 회복
      })),

      addCurrency: (type, amount) => set(s => ({
        currencies: { ...s.currencies, [type]: s.currencies[type] + amount }
      })),

      spendCurrency: (type, amount) => {
        if (get().currencies[type] < amount) return false
        set(s => ({ currencies: { ...s.currencies, [type]: s.currencies[type] - amount } }))
        return true
      },

      unlockPieceSlot: () => set(s => ({
        pieceSlots: Math.min(6, s.pieceSlots + 1)
      })),

      advanceFloor: () => set(s => ({
        currentFloor: s.currentFloor + 1,
        currentZone: s.currentFloor >= 20 ? 3 : s.currentFloor >= 10 ? 2 : s.currentZone,
        stats: { ...s.stats, floorsCleared: s.stats.floorsCleared + 1 },
      })),

      completeCurrentNode: () => set(s => ({
        runMap: {
          ...s.runMap,
          nodes: s.runMap.nodes.map(n =>
            n.id === s.runMap.currentNodeId ? { ...n, completed: true } : n
          ),
        },
      })),

      recordDeath: (pieceId) => set(s => ({
        defeatedPieces: [...new Set([...s.defeatedPieces, pieceId])],
        stats: { ...s.stats, totalDeaths: s.stats.totalDeaths + 1 },
      })),

      endRun: (result) => set({ runResult: result, isRunActive: false }),

      resetRun: () => set(INITIAL_STATE),

      setCurrentNodeId: (nodeId) => set(s => ({
        runMap: { ...s.runMap, currentNodeId: nodeId }
      })),

      addTurns: (count) => set(s => ({
        stats: { ...s.stats, totalTurns: s.stats.totalTurns + count }
      })),

      recordChainCollision: (chainLength) => set(s => ({
        stats: {
          ...s.stats,
          maxChainCollision: Math.max(s.stats.maxChainCollision, chainLength)
        }
      })),

      recordBossDefeat: () => set(s => ({
        stats: { ...s.stats, bossesDefeated: s.stats.bossesDefeated + 1 }
      })),
    }),
    {
      name: 'vanguard-push-run',
    }
  )
)
