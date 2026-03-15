// src/components/modals/BossPhasePanel.tsx
// 보스전 페이즈 패널

import { clsx } from 'clsx'

interface Props {
  phase: 1 | 2 | 3
}

const PHASE_INFO = {
  1: { name: '제1단계', desc: '보스가 본격적인 공격을 시작하지 않았습니다.', color: 'text-emerald-400' },
  2: { name: '제2단계', desc: '보스가 강화됩니다. 새로운 패턴이 추가됩니다.', color: 'text-amber-400' },
  3: { name: '최종단계', desc: '보스가 최대 강화 상태입니다. 처치가 임박했습니다!', color: 'text-red-400' },
}

export function BossPhasePanel({ phase }: Props) {
  const info = PHASE_INFO[phase]

  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-slate-700 rounded-lg px-6 py-3 shadow-lg">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {[1, 2, 3].map(p => (
            <div
              key={p}
              className={clsx(
                'w-3 h-3 rounded-full transition-colors',
                p <= phase ? 'bg-red-500' : 'bg-slate-600'
              )}
            />
          ))}
        </div>
        <div>
          <div className={clsx('font-semibold text-sm', info.color)}>
            {info.name}
          </div>
          <div className="text-xs text-slate-400">{info.desc}</div>
        </div>
      </div>
    </div>
  )
}
