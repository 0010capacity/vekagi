// src/components/board/Cell.tsx
// 보드 셀 컴포넌트

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
  danger_spike: 'bg-[#E24B4A]/80',
  danger_pit: 'bg-gray-950',
  danger_lava: 'bg-orange-900/80',
  ice: 'bg-cyan-900/60',
}

export function Cell({
  tileType,
  piece,
  isHighlighted,
  pushPreview,
  isSelected,
  onClick
}: CellProps) {
  const hasEnemy = piece?.owner === 'enemy' && !piece.isDead

  return (
    <div
      className={clsx(
        'relative w-14 h-14 sm:w-16 sm:h-16 rounded cursor-pointer border-2 flex items-center justify-center transition-all',
        TILE_STYLES[tileType],
        isHighlighted && !hasEnemy && 'bg-blue-500/30 border-blue-400 ring-2 ring-blue-400/50',
        isHighlighted && hasEnemy && 'bg-red-500/30 border-red-400 ring-2 ring-red-400/50',
        isSelected && 'border-yellow-400',
        !isHighlighted && !isSelected && 'border-slate-700/50',
      )}
      onClick={onClick}
    >
      {piece && <PieceTokenComponent piece={piece} isSelected={isSelected} />}

      {/* 이동 가능 표시 (빈 칸) */}
      {isHighlighted && !piece && !hasEnemy && (
        <div className="w-4 h-4 rounded-full bg-blue-400/60" />
      )}

      {/* 충돌 예정 표시 (적 기물 있는 칸) */}
      {isHighlighted && hasEnemy && !piece?.isDead && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-red-400 text-2xl font-bold animate-pulse">⚔</span>
        </div>
      )}

      {/* 타일 아이콘 */}
      {!piece && tileType !== 'normal' && !isHighlighted && (
        <span className="text-sm opacity-50">
          {tileType === 'danger_spike' && '▲'}
          {tileType === 'danger_pit' && '○'}
          {tileType === 'danger_lava' && '~'}
          {tileType === 'ice' && '❄'}
        </span>
      )}
    </div>
  )
}
