// src/screens/PiecePick.tsx
// 초기 기물 선택 화면

import { useState, useMemo } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useRunStore } from '@/stores/runStore'
import { PieceCard } from '@/components/pieces/PieceCard'
import { PIECES } from '@/data/pieces'

export function PiecePick() {
  const { setScreen } = useUIStore()
  const { startRun } = useRunStore()
  const [selected, setSelected] = useState<number[]>([])

  // 시작 풀: 전사형과 지원형 위주로 랜덤 6종
  const pool = useMemo(() => {
    return PIECES
      .filter(p => ['전사형', '지원형'].includes(p.category))
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
  }, [])

  const toggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const confirm = () => {
    const pieces = pool.filter(p => selected.includes(p.id))
    startRun(pieces)
    setScreen('run_map')
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-slate-950">
      <h2 className="text-2xl font-bold mb-2 text-center">초기 기물 선택</h2>
      <p className="text-slate-400 mb-6 text-center">3개를 선택하세요 ({selected.length}/3)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 w-full max-w-4xl">
        {pool.map(piece => (
          <PieceCard
            key={piece.id}
            piece={piece}
            selected={selected.includes(piece.id)}
            onClick={() => toggle(piece.id)}
          />
        ))}
      </div>

      <button
        disabled={selected.length !== 3}
        onClick={confirm}
        className="bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
      >
        출정 →
      </button>
    </div>
  )
}
