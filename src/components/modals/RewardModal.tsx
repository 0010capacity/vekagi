// src/components/modals/RewardModal.tsx
// 보상 모달

import { useState } from 'react'
import { useRunStore } from '@/stores/runStore'
import { PieceCard } from '@/components/pieces/PieceCard'
import { FormationCard } from '@/components/formations/FormationCard'
import type { PieceDefinition, Formation } from '@/types/game'

interface RewardOption {
  type: 'piece' | 'formation' | 'heal' | 'currency'
  data?: PieceDefinition | Formation
}

interface Props {
  options: RewardOption[]
  onComplete: () => void
}

export function RewardModal({ options, onComplete }: Props) {
  const [selected, setSelected] = useState<number | null>(null)
  const run = useRunStore()

  const handleConfirm = () => {
    if (selected === null) return

    const option = options[selected]
    switch (option.type) {
      case 'piece':
        if (option.data && 'move' in option.data) {
          run.addPiece(option.data)
        }
        break
      case 'formation':
        if (option.data && 'slots' in option.data) {
          run.addFormation(option.data)
        }
        break
      case 'heal':
        run.healCommander(3)
        break
      case 'currency':
        run.addCurrency('전투결정', 5)
        break
    }

    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-2xl w-full mx-4">
        <h3 className="text-xl font-bold mb-4">보상 선택</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {options.map((option, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`rounded-lg transition-all ${
                selected === i ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              {option.type === 'piece' && option.data && 'move' in option.data && (
                <PieceCard piece={option.data} selected={selected === i} />
              )}
              {option.type === 'formation' && option.data && 'slots' in option.data && (
                <FormationCard formation={option.data} selected={selected === i} />
              )}
              {option.type === 'heal' && (
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="font-semibold text-emerald-400">치유</div>
                  <div className="text-sm text-slate-300">지휘관 HP +3</div>
                </div>
              )}
              {option.type === 'currency' && (
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="font-semibold text-yellow-400">전투결정</div>
                  <div className="text-sm text-slate-300">◆ +5</div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onComplete}
            className="text-slate-400 hover:text-white px-4 py-2 text-sm transition-colors"
          >
            건너뛰기
          </button>
          <button
            disabled={selected === null}
            onClick={handleConfirm}
            className="bg-blue-700 disabled:bg-slate-700 text-white px-6 py-2 rounded font-semibold transition-colors"
          >
            수령
          </button>
        </div>
      </div>
    </div>
  )
}
