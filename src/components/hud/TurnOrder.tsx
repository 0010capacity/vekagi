// src/components/hud/TurnOrder.tsx
// 턴 순서 표시 컴포넌트

import type { PieceToken } from '@/types/game'
import { PIECES } from '@/data/pieces'
import { clsx } from 'clsx'

interface TurnOrderProps {
  orderedPieces: Array<{ piece: PieceToken; roll: number }>
  currentTurn: number
}

export function TurnOrder({ orderedPieces, currentTurn }: TurnOrderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-slate-400 mb-1">턴 {currentTurn} 순서</div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {orderedPieces.map((item, index) => {
          const def = PIECES.find(p => p.id === item.piece.definitionId)
          const isPlayer = item.piece.owner === 'player'

          return (
            <div
              key={item.piece.instanceId}
              className={clsx(
                'flex flex-col items-center p-1 rounded min-w-[40px]',
                isPlayer ? 'bg-[#185FA5]/30' : 'bg-[#A32D2D]/30',
                index === 0 && 'ring-1 ring-yellow-400'
              )}
              title={`${def?.name ?? '??'} (우선권: ${item.roll})`}
            >
              <span className="text-[10px] text-white font-bold">
                {def?.name.slice(0, 2) ?? '??'}
              </span>
              <span className="text-[8px] text-slate-400">{item.roll}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
