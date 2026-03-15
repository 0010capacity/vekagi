// src/components/hud/HPBar.tsx
// 지휘관 HP 바 컴포넌트

interface HPBarProps {
  current: number
  max: number
}

export function HPBar({ current, max }: HPBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const color = pct > 50 ? 'bg-emerald-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2 min-w-36">
      <span className="text-xs text-slate-400 whitespace-nowrap">지휘관</span>
      <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-300 whitespace-nowrap font-mono">{current}/{max}</span>
    </div>
  )
}
