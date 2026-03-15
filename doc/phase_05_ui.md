# Phase 5 — UI 컴포넌트

> **이 단계에서 완료할 것:** 핵심 UI 컴포넌트 전체
> **선행 조건:** Phase 4 완료

---

## 체크리스트

- [ ] `src/components/board/GameBoard.tsx`
- [ ] `src/components/board/Cell.tsx`
- [ ] `src/components/board/PieceToken.tsx`
- [ ] `src/components/hud/APBar.tsx`
- [ ] `src/components/hud/HPBar.tsx`
- [ ] `src/components/hud/TurnOrder.tsx`
- [ ] `src/components/hud/CountdownTimer.tsx`
- [ ] `src/components/pieces/PieceCard.tsx`
- [ ] `src/components/pieces/PieceStats.tsx`
- [ ] `src/components/pieces/TraitBadge.tsx`
- [ ] `src/components/formations/FormationCard.tsx`
- [ ] `src/components/map/RunMap.tsx`
- [ ] `src/components/map/NodeIcon.tsx`
- [ ] `.agent/progress.md` 업데이트

---

## 색상 클래스 규칙

```
아군 기물:     bg-[#185FA5] text-white
적 기물:       bg-[#A32D2D] text-white
선택된 기물:   ring-2 ring-yellow-400
이동 예약:     ring-2 ring-blue-300 opacity-80
위험 타일:     bg-[#E24B4A]
이동 가능 칸:  bg-blue-600/40
의도 화살표:   text-[#EF9F27]
버프 상태:     text-[#1D9E75]
카운트다운:    text-[#854F0B]
```

---

## GameBoard.tsx

```tsx
import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { Cell } from './Cell'

export function GameBoard() {
  const { board, playerPieces, enemyPieces, selectedPieceId } = useGameStore()
  const { previewMoves, previewPushResult, hoveredCell } = useUIStore()
  const { handlePieceSelect } = useGameEngine()

  const size = board.size
  const gridCols = size === 6 ? 'grid-cols-6' : size === 7 ? 'grid-cols-7' : 'grid-cols-8'

  const handleCellClick = (pos: { row: number; col: number }) => {
    const piece = board.pieces[pos.row]?.[pos.col]
    if (piece?.owner === 'player') {
      handlePieceSelect(piece.instanceId)
    } else if (selectedPieceId && previewMoves.some(m => m.row === pos.row && m.col === pos.col)) {
      useGameStore.getState().reserveMove(selectedPieceId, pos)
      handlePieceSelect(null)
    }
  }

  return (
    <div className={`grid ${gridCols} gap-1 p-2 bg-slate-900 rounded-lg`}>
      {board.tiles.map((row, r) =>
        row.map((tile, c) => {
          const piece = board.pieces[r]?.[c]
          const isHighlighted = previewMoves.some(m => m.row === r && m.col === c)
          const pushPreview = previewPushResult.get(`${r},${c}`)
          const isSelected = piece?.instanceId === selectedPieceId

          return (
            <Cell
              key={`${r}-${c}`}
              position={{ row: r, col: c }}
              tileType={tile}
              piece={piece ?? undefined}
              isHighlighted={isHighlighted}
              pushPreview={pushPreview}
              isSelected={isSelected}
              onClick={() => handleCellClick({ row: r, col: c })}
            />
          )
        })
      )}
    </div>
  )
}
```

---

## Cell.tsx

```tsx
import type { Position, PieceToken, TileType } from '@/types/game'
import { PieceTokenComponent } from './PieceToken'
import { clsx } from 'clsx'

interface CellProps {
  position: Position
  tileType: TileType
  piece?: PieceToken
  isHighlighted: boolean
  pushPreview?: number
  isSelected: boolean
  onClick: () => void
}

const TILE_STYLES: Record<TileType, string> = {
  normal: 'bg-slate-800 hover:bg-slate-700',
  danger_spike: 'bg-red-900/80',
  danger_pit: 'bg-gray-950',
  danger_lava: 'bg-orange-900/80',
  ice: 'bg-cyan-900/60',
}

export function Cell({ position, tileType, piece, isHighlighted, pushPreview, isSelected, onClick }: CellProps) {
  return (
    <div
      className={clsx(
        'relative w-10 h-10 rounded cursor-pointer border border-slate-700/50 flex items-center justify-center transition-colors',
        TILE_STYLES[tileType],
        isHighlighted && 'bg-blue-600/40 border-blue-500',
        isSelected && 'border-yellow-400',
      )}
      onClick={onClick}
    >
      {piece && <PieceTokenComponent piece={piece} isSelected={isSelected} />}
      {isHighlighted && pushPreview !== undefined && !piece && (
        <span className="text-blue-300 text-xs font-bold">{pushPreview}</span>
      )}
    </div>
  )
}
```

---

## PieceToken.tsx

Framer Motion으로 이동 애니메이션 처리.

```tsx
import { motion } from 'framer-motion'
import type { PieceToken } from '@/types/game'
import { PIECES } from '@/data/pieces'
import { clsx } from 'clsx'

interface Props {
  piece: PieceToken
  isSelected: boolean
}

export function PieceTokenComponent({ piece, isSelected }: Props) {
  const def = PIECES.find(p => p.id === piece.definitionId)
  const isPlayer = piece.owner === 'player'

  return (
    <motion.div
      layoutId={piece.instanceId}
      layout
      className={clsx(
        'w-8 h-8 rounded flex flex-col items-center justify-center text-white cursor-pointer select-none',
        isPlayer ? 'bg-blue-700' : 'bg-red-800',
        isSelected && 'ring-2 ring-yellow-400 scale-105',
        piece.isSealed && 'opacity-50',
      )}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      whileHover={{ scale: 1.1 }}
    >
      <span className="text-[9px] font-bold leading-none">
        {def?.name.slice(0, 2) ?? '??'}
      </span>
      <span className="text-[8px] opacity-70">
        {piece.currentForce}/{piece.currentMass}
      </span>
      {/* 카운트다운 타이머 */}
      {piece.countdown && piece.countdown.currentTurns > 0 && (
        <span className="absolute -top-1 -right-1 bg-amber-700 text-white rounded-full w-4 h-4 text-[8px] flex items-center justify-center">
          {piece.countdown.currentTurns}
        </span>
      )}
    </motion.div>
  )
}
```

---

## APBar.tsx

```tsx
interface APBarProps { current: number; max: number }

export function APBar({ current, max }: APBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">AP</span>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-sm transition-colors ${
              i < current ? 'bg-blue-500' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-slate-400">{current}/{max}</span>
    </div>
  )
}
```

---

## HPBar.tsx

```tsx
interface HPBarProps { current: number; max: number }

export function HPBar({ current, max }: HPBarProps) {
  const pct = Math.max(0, (current / max) * 100)
  const color = pct > 50 ? 'bg-emerald-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2 min-w-32">
      <span className="text-xs text-slate-400 whitespace-nowrap">지휘관</span>
      <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-300 whitespace-nowrap">{current}/{max}</span>
    </div>
  )
}
```

---

## PieceCard.tsx

기물 카드 UI (기물 픽, 사이드 패널 등에서 사용).

```tsx
import type { PieceDefinition } from '@/types/game'
import { PieceStats } from './PieceStats'
import { TraitBadge } from './TraitBadge'

interface Props {
  piece: PieceDefinition
  selected?: boolean
  onClick?: () => void
  compact?: boolean
}

export function PieceCard({ piece, selected, onClick, compact }: Props) {
  return (
    <div
      className={`bg-slate-800 border rounded-lg p-3 cursor-pointer transition-all ${
        selected
          ? 'border-blue-400 ring-1 ring-blue-400'
          : 'border-slate-700 hover:border-slate-500'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-white text-sm">{piece.name}</div>
          <div className="text-xs text-slate-400">{piece.move}</div>
        </div>
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
          AP {piece.ap}
        </span>
      </div>

      {!compact && <PieceStats force={piece.force} mass={piece.mass} agility={piece.agility} />}

      {piece.traits.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {piece.traits.map(t => <TraitBadge key={t} trait={t} />)}
        </div>
      )}

      {!compact && (
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{piece.desc}</p>
      )}
    </div>
  )
}
```

---

## TraitBadge.tsx

```tsx
interface Props { trait: string }

function getTraitColor(trait: string): string {
  if (['양날의검','무른','순교자','폭사'].some(t => trait.includes(t)))
    return 'bg-red-900/60 text-red-300 border-red-800'
  if (['관통','반탄','고정대','가시'].some(t => trait.includes(t)))
    return 'bg-orange-900/60 text-orange-300 border-orange-800'
  if (['고취','방벽','가속'].some(t => trait.includes(t)))
    return 'bg-emerald-900/60 text-emerald-300 border-emerald-800'
  if (['교란','약화'].some(t => trait.includes(t)))
    return 'bg-purple-900/60 text-purple-300 border-purple-800'
  if (['각성','붕괴','소환','봉인'].some(t => trait.includes(t)))
    return 'bg-amber-900/60 text-amber-300 border-amber-800'
  return 'bg-slate-700 text-slate-300 border-slate-600'
}

export function TraitBadge({ trait }: Props) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTraitColor(trait)}`}>
      {trait}
    </span>
  )
}
```

---

## 완료 후

`.agent/progress.md` 에 추가:
```
## Phase 5 완료
- 모든 UI 컴포넌트 ✓
다음 단계: phase_06_screens.md
```
