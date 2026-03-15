// src/components/pieces/PieceCard.tsx
// 기물 카드 UI 컴포넌트

import type { PieceDefinition } from '@/types/game'
import { PieceStats } from './PieceStats'
import { TraitBadge } from './TraitBadge'
import { clsx } from 'clsx'

interface Props {
  piece: PieceDefinition
  selected?: boolean
  onClick?: () => void
  compact?: boolean
  disabled?: boolean
}

export function PieceCard({ piece, selected, onClick, compact, disabled }: Props) {
  return (
    <div
      className={clsx(
        'bg-slate-800 border rounded-lg p-3 cursor-pointer transition-all',
        selected
          ? 'border-blue-400 ring-1 ring-blue-400'
          : 'border-slate-700 hover:border-slate-500',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-white text-sm">{piece.name}</div>
          <div className="text-xs text-slate-400">{piece.category} · {piece.move}</div>
        </div>
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
          AP {piece.ap}
        </span>
      </div>

      {!compact && (
        <PieceStats force={piece.force} mass={piece.mass} agility={piece.agility} />
      )}

      {piece.traits.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {piece.traits.map(t => (
            <TraitBadge key={t} trait={t} />
          ))}
        </div>
      )}

      {!compact && (
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{piece.desc}</p>
      )}

      {/* 카운트다운 표시 */}
      {piece.countdown && (
        <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
          <span className="font-bold">{piece.countdown.currentTurns}턴</span>
          <span>후 {piece.countdown.type === 'awaken' ? '각성' : piece.countdown.type === 'collapse' ? '붕괴' : piece.countdown.type === 'summon' ? '소환' : '봉인'}</span>
        </div>
      )}
    </div>
  )
}
