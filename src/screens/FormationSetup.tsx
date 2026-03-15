// src/screens/FormationSetup.tsx
// 진형 선택 화면

import { useState } from 'react'
import { useRunStore } from '@/stores/runStore'
import { useUIStore } from '@/stores/uiStore'
import { FormationCard } from '@/components/formations/FormationCard'
import { FORMATIONS } from '@/data/formations'

export function FormationSetup() {
  const run = useRunStore()
  const { setScreen } = useUIStore()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // 보유 진형 없으면 기본 진형 제공
  const available = run.ownedFormations.length > 0
    ? run.ownedFormations
    : FORMATIONS.filter(f => f.rarity === '기본')

  const confirm = () => {
    const formation = available.find(f => f.id === selectedId)
    if (!formation) return
    run.setActiveFormation(formation)
    setScreen('battle')
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-slate-950">
      <h2 className="text-2xl font-bold mb-2 text-center">진형 선택</h2>
      <p className="text-slate-400 mb-6 text-center">이번 층에 사용할 진형을 선택하세요</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 w-full max-w-4xl">
        {available.map(f => (
          <FormationCard
            key={f.id}
            formation={f}
            selected={selectedId === f.id}
            onClick={() => setSelectedId(f.id)}
          />
        ))}
      </div>

      <button
        disabled={selectedId === null}
        onClick={confirm}
        className="bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
      >
        배치 →
      </button>
    </div>
  )
}
