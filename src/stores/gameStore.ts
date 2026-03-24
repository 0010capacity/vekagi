// src/stores/gameStore.ts
// 전투 상태 관리

import { create } from 'zustand'
import type { GameState, PieceToken, Position, TileType, CombatLogEntry } from '@/types/game'
import { PIECES } from '@/data/pieces'

interface GameStore extends GameState {
  selectPiece: (pieceId: string | null) => void
  reserveMove: (pieceId: string, to: Position) => boolean
  cancelMove: (pieceId: string) => void
  endTurn: () => void
  applyTurnResult: (updatedPieces: PieceToken[]) => void
  updatePiecePosition: (pieceId: string, position: Position) => void
  initBattle: (params: {
    playerPieces: PieceToken[]
    enemyPieces: PieceToken[]
    boardSize: 6 | 7 | 8
    dangerTiles?: Array<{ row: number; col: number; type: TileType }>
    isBoss?: boolean
  }) => void
  checkBattleEnd: () => 'victory' | 'defeat' | 'ongoing'
  setBossPhase: (phase: 1 | 2 | 3) => void
  addLogEntry: (type: CombatLogEntry['type'], message: string) => void
  killPiece: (pieceId: string) => void
  resetBattle: () => void
}

const INITIAL_STATE: GameState = {
  board: { size: 6, tiles: [], pieces: [] },
  playerPieces: [],
  enemyPieces: [],
  currentAP: 6,
  maxAP: 6,
  turnNumber: 1,
  phase: 'plan',
  selectedPieceId: null,
  pendingMoves: [],
  turnOrder: [],
  combatLog: [],
  activeFormationEffects: [],
  isBossBattle: false,
  bossPhase: 1,
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,

  selectPiece: (pieceId) => set({ selectedPieceId: pieceId }),

  reserveMove: (pieceId, to) => {
    const state = get()
    const piece = state.playerPieces.find(p => p.instanceId === pieceId)
    if (!piece) return false

    const def = PIECES.find(p => p.id === piece.definitionId)
    const apCost = def?.ap ?? 1

    if (state.currentAP < apCost) return false

    const dr = to.row - piece.position.row
    const dc = to.col - piece.position.col

    set(s => ({
      currentAP: s.currentAP - apCost,
      pendingMoves: [
        ...s.pendingMoves.filter(m => m.pieceId !== pieceId),
        { pieceId, direction: { dr, dc }, apCost },
      ],
    }))
    return true
  },

  cancelMove: (pieceId) => {
    const move = get().pendingMoves.find(m => m.pieceId === pieceId)
    if (!move) return
    set(s => ({
      currentAP: s.currentAP + move.apCost,
      pendingMoves: s.pendingMoves.filter(m => m.pieceId !== pieceId),
    }))
  },

  endTurn: () => set({ phase: 'resolve' }),

  applyTurnResult: (updatedPieces) => {
    const players = updatedPieces.filter(p => p.owner === 'player')
    const enemies = updatedPieces.filter(p => p.owner === 'enemy')
    const size = get().board.size
    const newPieces: (PieceToken | null)[][] = Array(size).fill(null).map(() =>
      Array(size).fill(null)
    )
    updatedPieces.filter(p => !p.isDead || p.isDying).forEach(p => {
      if (p.position.row >= 0 && p.position.row < size && p.position.col >= 0 && p.position.col < size) {
        newPieces[p.position.row][p.position.col] = p
      }
    })
    set(s => ({
      playerPieces: players,
      enemyPieces: enemies,
      board: { ...s.board, pieces: newPieces },
      phase: 'plan',
      pendingMoves: [],
      currentAP: 6,
      turnNumber: s.turnNumber + 1,
    }))
  },

  updatePiecePosition: (pieceId, position) =>
    set(s => ({
      playerPieces: s.playerPieces.map(p =>
        p.instanceId === pieceId ? { ...p, position } : p
      ),
      enemyPieces: s.enemyPieces.map(p =>
        p.instanceId === pieceId ? { ...p, position } : p
      ),
    })),

  initBattle: ({ playerPieces, enemyPieces, boardSize, dangerTiles = [], isBoss = false }) => {
    const tiles: TileType[][] = Array(boardSize).fill(null).map(() =>
      Array(boardSize).fill('normal' as TileType)
    )
    dangerTiles.forEach(({ row, col, type }) => { tiles[row][col] = type })

    const pieces: (PieceToken | null)[][] = Array(boardSize).fill(null).map(() =>
      Array(boardSize).fill(null)
    )
    ;[...playerPieces, ...enemyPieces].forEach(p => {
      pieces[p.position.row][p.position.col] = p
    })

    set({
      board: { size: boardSize, tiles, pieces },
      playerPieces,
      enemyPieces,
      currentAP: 6,
      maxAP: 6,
      turnNumber: 1,
      phase: 'plan',
      pendingMoves: [],
      combatLog: [],
      isBossBattle: isBoss,
      bossPhase: 1,
    })
  },

  checkBattleEnd: () => {
    const state = get()
    if (state.enemyPieces.filter(p => !p.isDead).length === 0) return 'victory'
    if (state.playerPieces.filter(p => !p.isDead).length === 0) return 'defeat'
    return 'ongoing'
  },

  setBossPhase: (phase) => set({ bossPhase: phase }),

  addLogEntry: (type, message) =>
    set(s => ({
      combatLog: [
        ...s.combatLog,
        { turn: s.turnNumber, type, message },
      ],
    })),

  killPiece: (pieceId) =>
    set(s => ({
      playerPieces: s.playerPieces.map(p =>
        p.instanceId === pieceId ? { ...p, isDead: true } : p
      ),
      enemyPieces: s.enemyPieces.map(p =>
        p.instanceId === pieceId ? { ...p, isDead: true } : p
      ),
    })),

  resetBattle: () => set(INITIAL_STATE),
}))
