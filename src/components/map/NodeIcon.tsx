// src/components/map/NodeIcon.tsx
// 맵 노드 아이콘 컴포넌트

import type { NodeType } from '@/types/game'
import { clsx } from 'clsx'

interface Props {
  type: NodeType
  completed?: boolean
  current?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const NODE_CONFIG: Record<NodeType, { icon: string; color: string; label: string }> = {
  battle: { icon: '⚔', color: 'bg-slate-700 border-slate-500', label: '전투' },
  elite: { icon: '★', color: 'bg-yellow-900 border-yellow-600', label: '정예' },
  rest: { icon: '⌂', color: 'bg-green-900 border-green-600', label: '거점' },
  shop: { icon: '$', color: 'bg-blue-900 border-blue-600', label: '상인' },
  event: { icon: '?', color: 'bg-purple-900 border-purple-600', label: '이벤트' },
  boss: { icon: '☠', color: 'bg-red-900 border-red-600', label: '보스' },
}

export function NodeIcon({ type, completed, current, size = 'md' }: Props) {
  const config = NODE_CONFIG[type]

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  }

  return (
    <div
      className={clsx(
        'rounded-full border-2 flex items-center justify-center font-bold transition-all',
        sizeClasses[size],
        config.color,
        completed && 'opacity-50',
        current && 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900 animate-pulse'
      )}
      title={config.label}
    >
      {config.icon}
    </div>
  )
}

export function getNodeConfig(type: NodeType) {
  return NODE_CONFIG[type]
}
