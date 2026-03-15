// src/screens/MainMenu.tsx
// 메인 메뉴 화면

import { useUIStore } from '@/stores/uiStore'
import { useSaveLoad } from '@/hooks/useSaveLoad'

export function MainMenu() {
  const { setScreen } = useUIStore()
  const { hasSavedRun } = useSaveLoad()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-widest text-white mb-2 font-mono">
          VANGUARD PUSH
        </h1>
        <p className="text-slate-400">물리 기반 전략 로그라이크</p>
      </div>

      <div className="flex flex-col gap-3 w-48">
        <button
          className="bg-blue-700 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
          onClick={() => setScreen('piece_pick')}
        >
          새 게임
        </button>

        {hasSavedRun() && (
          <button
            className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors"
            onClick={() => setScreen('run_map')}
          >
            이어하기
          </button>
        )}

        <button className="text-slate-400 hover:text-white py-2 text-sm transition-colors">
          업적
        </button>
      </div>

      <div className="text-xs text-slate-600 mt-8">
        v0.1.0 · 2026
      </div>
    </div>
  )
}
