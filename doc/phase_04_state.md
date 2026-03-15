# Phase 4 — 상태 관리

> **이 단계에서 완료할 것:** Zustand 스토어 3개 전체 구현
> **선행 조건:** Phase 3 완료

---

## 체크리스트

- [ ] `src/stores/gameStore.ts` — 전투 상태
- [ ] `src/stores/runStore.ts` — 런 전체 상태 (localStorage 저장)
- [ ] `src/stores/uiStore.ts` — UI 상태
- [ ] `src/hooks/useGameEngine.ts` — 게임 엔진 통합 훅
- [ ] `src/hooks/useSaveLoad.ts` — 저장/불러오기
- [ ] `.agent/progress.md` 업데이트

---

## src/stores/gameStore.ts

```typescript
import { create } from 'zustand'
import type { GameState, PieceToken, Position, PendingMove, BoardState, TileType } from '@/types/game'
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
  addLogEntry: (type: string, message: string) => void
  killPiece: (pieceId: string) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
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

  selectPiece: (pieceId) => set({ selectedPieceId: pieceId }),

  reserveMove: (pieceId, to) => {
    const state = get()
    const piece = state.playerPieces.find(p => p.instanceId === pieceId)
    if (!piece) return false

    const def = PIECES.find(p => p.id === piece.definitionId)
    const apCost = def?.ap ?? 1

    if (state.currentAP < apCost) return false

    set(s => ({
      currentAP: s.currentAP - apCost,
      pendingMoves: [
        ...s.pendingMoves.filter(m => m.pieceId !== pieceId),
        { pieceId, from: piece.position, to, apCost },
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
    const newPieces = Array(get().board.size).fill(null).map(() =>
      Array(get().board.size).fill(null)
    )
    updatedPieces.filter(p => !p.isDead).forEach(p => {
      newPieces[p.position.row][p.position.col] = p
    })
    set(s => ({
      playerPieces: players,
      enemyPieces: enemies,
      board: { ...s.board, pieces: newPieces },
      phase: 'countdown',
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
        { turn: s.turnNumber, type: type as any, message },
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
}))
```

---

## src/stores/runStore.ts

```typescript
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
    totalTurns: 0, totalDeaths: 0,
    maxChainCollision: 0, floorsCleared: 0, bossesDefeated: 0,
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
    }),
    {
      name: 'vanguard-push-run',
      // 저장하지 않을 필드 (runMap은 재생성 가능하므로 저장)
    }
  )
)
```

---

## src/stores/uiStore.ts

```typescript
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
  clearAnimationQueue: () => void
  setIsAnimating: (v: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  currentScreen: 'main_menu',
  modalOpen: null,
  selectedPieceForModal: null,
  hoveredCell: null,
  previewMoves: [],
  previewPushResult: new Map(),
  animationQueue: [],
  isAnimating: false,

  setScreen: (screen) => set({ currentScreen: screen }),
  openModal: (modal, piece) => set({ modalOpen: modal, selectedPieceForModal: piece ?? null }),
  closeModal: () => set({ modalOpen: null, selectedPieceForModal: null }),
  setHoveredCell: (pos) => set({ hoveredCell: pos }),
  setPreviewMoves: (moves) => set({ previewMoves: moves }),
  setPreviewPushResult: (results) => set({ previewPushResult: results }),
  queueAnimation: (entry) => set(s => ({ animationQueue: [...s.animationQueue, entry] })),
  clearAnimationQueue: () => set({ animationQueue: [] }),
  setIsAnimating: (v) => set({ isAnimating: v }),
}))
```

---

## src/hooks/useGameEngine.ts

게임 엔진과 스토어를 연결하는 통합 훅.

```typescript
import { useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useRunStore } from '@/stores/runStore'
import { useUIStore } from '@/stores/uiStore'
import { useAI } from './useAI'
import { determineTurnOrder, resolvePieceMove } from '@/engine/turnEngine'
import { tickCountdowns, tickSealedStatus } from '@/engine/countdownEngine'
import { getValidMoves } from '@/engine/moveEngine'
import { PIECES } from '@/data/pieces'

export function useGameEngine() {
  const game = useGameStore()
  const run = useRunStore()
  const ui = useUIStore()
  const { computeAITurn } = useAI()

  // 기물 선택 + 이동 미리보기 계산
  const handlePieceSelect = useCallback((pieceId: string | null) => {
    game.selectPiece(pieceId)
    if (!pieceId) { ui.setPreviewMoves([]); return }

    const piece = game.playerPieces.find(p => p.instanceId === pieceId)
    if (!piece) return

    const def = PIECES.find(p => p.id === piece.definitionId)
    if (!def) return

    const moves = getValidMoves(piece, game.board, def.move)
    ui.setPreviewMoves(moves)
  }, [game, ui])

  // 턴 종료 → AI 계산 → 실행
  const handleEndTurn = useCallback(async () => {
    game.endTurn()
    ui.setIsAnimating(true)

    // AI 행동 계산
    const aiResponse = await computeAITurn({
      type: 'compute_turn',
      gameState: { ...game },
      aiPieces: game.enemyPieces,
      archetype: 'aggressive',
      difficulty: game.isBossBattle ? 3 : 2,
    })

    // 우선권 결정
    const ordered = determineTurnOrder([...game.playerPieces, ...game.enemyPieces])

    // 순서대로 이동 처리
    // (실제 구현은 애니메이션 큐와 연동)

    // 카운트다운
    const { events } = tickCountdowns([...game.playerPieces, ...game.enemyPieces])

    // 지휘관 HP 처리 (사망한 플레이어 기물)
    // run.damageCommander(...)

    ui.setIsAnimating(false)

    // 전투 종료 체크
    const result = game.checkBattleEnd()
    if (result !== 'ongoing') {
      if (result === 'victory') {
        run.completeCurrentNode()
        ui.setScreen('reward')
      } else {
        run.endRun('defeat')
        ui.setScreen('run_end')
      }
    }
  }, [game, run, ui, computeAITurn])

  return { handlePieceSelect, handleEndTurn }
}
```

---

## src/hooks/useSaveLoad.ts

```typescript
import { useRunStore } from '@/stores/runStore'

const RUN_KEY = 'vanguard-push-run'

export function useSaveLoad() {
  const run = useRunStore()

  const hasSavedRun = (): boolean => {
    try {
      const saved = localStorage.getItem(RUN_KEY)
      if (!saved) return false
      const parsed = JSON.parse(saved)
      return parsed?.state?.isRunActive === true
    } catch { return false }
  }

  const clearSavedRun = () => {
    localStorage.removeItem(RUN_KEY)
    run.resetRun()
  }

  return { hasSavedRun, clearSavedRun }
}
```

---

## 완료 후

`.agent/progress.md` 에 추가:
```
## Phase 4 완료
- src/stores/gameStore.ts ✓
- src/stores/runStore.ts ✓
- src/stores/uiStore.ts ✓
- src/hooks/useGameEngine.ts ✓
- src/hooks/useSaveLoad.ts ✓
다음 단계: phase_05_ui.md
```
