// src/screens/RunEnd.tsx
// 런 종료 화면 (승리/패배)

import { useRunStore } from '@/stores/runStore'
import { useUIStore } from '@/stores/uiStore'
import { useSaveLoad } from '@/hooks/useSaveLoad'

export function RunEnd() {
  const run = useRunStore()
  const { setScreen } = useUIStore()
  const { clearSavedRun } = useSaveLoad()

  const isVictory = run.runResult === 'victory'

  const handleRestart = () => {
    clearSavedRun()
    setScreen('main_menu')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-slate-950">
      <div className="text-center">
        <div className={`text-5xl font-bold mb-2 ${isVictory ? 'text-yellow-400' : 'text-red-400'}`}>
          {isVictory ? '승리' : '패배'}
        </div>
        <p className="text-slate-400">
          {isVictory ? '최종 보스를 격파했다.' : '지휘관이 쓰러졌다.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {[
          { label: '클리어 층', value: run.stats.floorsCleared },
          { label: '처치 보스', value: run.stats.bossesDefeated },
          { label: '총 턴', value: run.stats.totalTurns },
          { label: '기물 사망', value: run.stats.totalDeaths },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {run.stats.maxChainCollision > 1 && (
        <div className="text-sm text-amber-400">
          최대 연쇄 충돌: {run.stats.maxChainCollision}회
        </div>
      )}

      <button
        onClick={handleRestart}
        className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
      >
        메인 메뉴
      </button>
    </div>
  )
}
