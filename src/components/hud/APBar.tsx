// src/components/hud/APBar.tsx
// AP(행동력) 바 컴포넌트

interface APBarProps {
  current: number
  max: number
}

export function APBar({ current, max }: APBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 font-medium">AP</span>
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-sm transition-colors ${
              i < current ? 'bg-blue-500 shadow-sm shadow-blue-500/50' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-slate-300 font-mono">{current}/{max}</span>
    </div>
  )
}
