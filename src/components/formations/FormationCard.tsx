// src/components/formations/FormationCard.tsx
// 진형 카드 컴포넌트

import type { Formation } from '@/types/game'
import { clsx } from 'clsx'

interface Props {
  formation: Formation
  selected?: boolean
  onClick?: () => void
  compact?: boolean
}

const RARITY_COLORS: Record<string, string> = {
  '기본': 'border-slate-600 bg-slate-800',
  '고급': 'border-blue-600 bg-blue-900/30',
  '희귀': 'border-purple-600 bg-purple-900/30',
  '전설': 'border-amber-500 bg-amber-900/30',
}

const RARITY_TEXT: Record<string, string> = {
  '기본': 'text-slate-400',
  '고급': 'text-blue-400',
  '희귀': 'text-purple-400',
  '전설': 'text-amber-400',
}

export function FormationCard({ formation, selected, onClick, compact }: Props) {
  return (
    <div
      className={clsx(
        'border rounded-lg p-3 cursor-pointer transition-all',
        RARITY_COLORS[formation.rarity],
        selected && 'ring-2 ring-yellow-400',
        'hover:brightness-110'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-white text-sm">{formation.name}</div>
          <div className={clsx('text-xs', RARITY_TEXT[formation.rarity])}>
            {formation.rarity} · {formation.slots}슬롯
          </div>
        </div>
        {formation.coreSlots > 0 && (
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
            핵심 {formation.coreSlots}
          </span>
        )}
      </div>

      {!compact && (
        <>
          <p className="text-xs text-slate-400 mb-2">{formation.sub}</p>

          {/* 그리드 패턴 시각화 */}
          {formation.gridPattern && (
            <div className="mb-2 font-mono text-[10px] text-slate-500 whitespace-pre bg-slate-900/50 p-1 rounded">
              {formation.gridPattern}
            </div>
          )}

          {/* 태그 */}
          {formation.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {formation.tags.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* 효과 */}
          {formation.effects.length > 0 && (
            <div className="space-y-1">
              {formation.effects.map((effect, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start gap-1">
                  <span className={clsx(
                    'px-1 rounded text-[10px]',
                    effect.type === '패시브' ? 'bg-green-900/50 text-green-300' :
                    effect.type === '액티브' ? 'bg-blue-900/50 text-blue-300' :
                    'bg-purple-900/50 text-purple-300'
                  )}>
                    {effect.type}
                  </span>
                  <span>{effect.text}</span>
                  {effect.apCost && (
                    <span className="text-slate-500">({effect.apCost}AP)</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
