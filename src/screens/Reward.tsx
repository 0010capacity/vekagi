// src/screens/Reward.tsx
// 보상 선택 화면

import { useState, useMemo } from 'react'
import { useRunStore } from '@/stores/runStore'
import { useUIStore } from '@/stores/uiStore'
import { useGameStore } from '@/stores/gameStore'
import { PieceCard } from '@/components/pieces/PieceCard'
import { FormationCard } from '@/components/formations/FormationCard'
import { generateRewardOptions, generateBossReward, type RewardOption } from '@/utils/rewardGenerator'

export function Reward() {
  const run = useRunStore()
  const game = useGameStore()
  const { setScreen } = useUIStore()
  const [selected, setSelected] = useState<number | null>(null)

  // 보상 생성 (구역/보스 기반)
  const rewards = useMemo<RewardOption[]>(() => {
    const zone = run.currentZone as 1 | 2 | 3
    const isElite = game.isBossBattle

    const ownedPieceIds = run.ownedPieces.map(p => p.id)
    const ownedFormationIds = run.ownedFormations.map(f => f.id)

    if (game.isBossBattle) {
      return generateBossReward(zone)
    }

    return generateRewardOptions(zone, isElite, ownedPieceIds, ownedFormationIds)
  }, [run.currentZone, run.ownedPieces, run.ownedFormations, game.isBossBattle])

  const handleConfirm = () => {
    if (selected === null) return

    const reward = rewards[selected]
    switch (reward.type) {
      case 'piece':
        run.addPiece(reward.piece)
        break
      case 'formation':
        run.addFormation(reward.formation)
        break
      case 'heal':
        run.healCommander(reward.amount)
        break
      case 'currency':
        run.addCurrency(reward.currencyType as keyof typeof run.currencies, reward.amount)
        break
    }

    setScreen('run_map')
  }

  const handleSkip = () => {
    setScreen('run_map')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-950">
      <h2 className="text-2xl font-bold mb-2 text-center">전투 보상</h2>
      <p className="text-slate-400 mb-6 text-center">보상을 선택하세요</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full max-w-4xl">
        {rewards.map((reward, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`text-left transition-all rounded-lg ${
              selected === i
                ? 'ring-2 ring-yellow-400 scale-105'
                : 'hover:scale-102'
            }`}
          >
            {reward.type === 'piece' && (
              <PieceCard piece={reward.piece} selected={selected === i} />
            )}
            {reward.type === 'formation' && (
              <FormationCard formation={reward.formation} selected={selected === i} />
            )}
            {reward.type === 'heal' && (
              <div className={`bg-slate-800 border rounded-lg p-4 ${selected === i ? 'border-emerald-400' : 'border-slate-700'}`}>
                <div className="text-lg font-semibold text-emerald-400">치유</div>
                <div className="text-sm text-slate-300 mt-2">
                  지휘관 HP +{reward.amount === 999 ? '완전회복' : reward.amount}
                </div>
              </div>
            )}
            {reward.type === 'currency' && (
              <div className={`bg-slate-800 border rounded-lg p-4 ${selected === i ? 'border-yellow-400' : 'border-slate-700'}`}>
                <div className="text-lg font-semibold text-yellow-400">{reward.currencyType}</div>
                <div className="text-sm text-slate-300 mt-2">+{reward.amount}</div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={handleSkip}
          className="text-slate-400 hover:text-white px-6 py-2 rounded transition-colors"
        >
          건너뛰기
        </button>
        <button
          disabled={selected === null}
          onClick={handleConfirm}
          className="bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-2 rounded-lg font-semibold transition-colors"
        >
          수령 →
        </button>
      </div>
    </div>
  )
}
