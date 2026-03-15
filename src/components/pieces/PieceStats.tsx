// src/components/pieces/PieceStats.tsx
// 기물 스탯 표시 컴포넌트

interface Props {
  force: number
  mass: number
  agility: number
  size?: 'sm' | 'md'
}

export function PieceStats({ force, mass, agility, size = 'md' }: Props) {
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs'
  const barHeight = size === 'sm' ? 'h-1' : 'h-1.5'
  const maxStat = 10

  const StatBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="flex items-center gap-1">
      <span className={`${textSize} text-slate-400 w-6`}>{label}</span>
      <div className={`flex-1 ${barHeight} bg-slate-700 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${color}`}
          style={{ width: `${Math.min(100, (value / maxStat) * 100)}%` }}
        />
      </div>
      <span className={`${textSize} text-slate-300 w-4 text-right font-mono`}>{value}</span>
    </div>
  )

  return (
    <div className="flex flex-col gap-1">
      <StatBar label="힘" value={force} color="bg-red-500" />
      <StatBar label="질" value={mass} color="bg-blue-500" />
      <StatBar label="민" value={agility} color="bg-green-500" />
    </div>
  )
}
