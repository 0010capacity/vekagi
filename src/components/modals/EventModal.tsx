// src/components/modals/EventModal.tsx
// 이벤트 모달

import { useState } from 'react'
import { EVENTS, type GameEvent } from '@/data/events'
import { useUIStore } from '@/stores/uiStore'
import { useRunStore } from '@/stores/runStore'
import { applyEventEffect, getRiskColor } from '@/utils/eventEffectParser'
import { clsx } from 'clsx'

export function EventModal() {
  const { closeModal, setScreen } = useUIStore()
  const run = useRunStore()
  const [event] = useState<GameEvent>(() =>
    EVENTS[Math.floor(Math.random() * EVENTS.length)]
  )
  const [resolved, setResolved] = useState(false)
  const [resultMessage, setResultMessage] = useState('')

  const handleChoice = (choice: typeof event.choices[0]) => {
    if (resolved) return
    setResolved(true)

    // 이펙트 파싱 및 적용 (유틸리티 사용)
    const result = applyEventEffect(choice.effect)
    setResultMessage(result.message)

    // 잠시 후 닫기
    setTimeout(() => {
      closeModal()
      run.completeCurrentNode()
      setScreen('run_map')
    }, 1500)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-xs text-slate-400 mb-1">{event.type}</div>
        <h3 className="text-xl font-bold mb-3">{event.name}</h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">{event.desc}</p>

        {resolved ? (
          <div className="text-center py-4">
            <div className="text-emerald-400 mb-2">선택을 완료했습니다...</div>
            {resultMessage && (
              <div className="text-sm text-slate-300 bg-slate-700/50 rounded p-2">
                {resultMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {event.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoice(choice)}
                className={clsx(
                  'text-left p-3 rounded-lg border transition-colors',
                  getRiskColor(choice.risk),
                  'hover:bg-slate-700/50'
                )}
              >
                <div className="font-semibold text-sm">{choice.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{choice.effect}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
