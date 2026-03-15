// src/components/hud/CountdownTimer.tsx
// 카운트다운 타이머 표시 컴포넌트

import type { PieceToken } from '@/types/game'
import { PIECES } from '@/data/pieces'
import { clsx } from 'clsx'

interface CountdownTimerProps {
  pieces: PieceToken[]
}

export function CountdownTimer({ pieces }: CountdownTimerProps) {
  // 카운트다운이 있는 기물만 필터링
  const countdownPieces = pieces.filter(p => p.countdown && p.countdown.currentTurns > 0)

  if (countdownPieces.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-[#854B0B] mb-1">카운트다운</div>
      <div className="flex gap-2 flex-wrap">
        {countdownPieces.map(piece => {
          const def = PIECES.find(p => p.id === piece.definitionId)
          const countdown = piece.countdown!

          return (
            <div
              key={piece.instanceId}
              className={clsx(
                'flex items-center gap-1 px-2 py-1 rounded text-xs',
                'bg-amber-900/40 border border-amber-800/50'
              )}
            >
              <span className="text-white font-medium">{def?.name ?? '??'}</span>
              <span className="text-amber-400 font-bold">
                {countdown.currentTurns}턴
              </span>
              <span className="text-slate-400 text-[10px]">
                →{countdown.type === 'awaken' ? '각성' : countdown.type === 'collapse' ? '붕괴' : countdown.type === 'summon' ? '소환' : '봉인해제'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
