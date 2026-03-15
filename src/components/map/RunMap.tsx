// src/components/map/RunMap.tsx
// 런 맵 컴포넌트

import { useRunStore } from '@/stores/runStore'
import { NodeIcon } from './NodeIcon'
import type { MapNode, RunMap as RunMapType } from '@/types/game'
import { clsx } from 'clsx'

interface Props {
  onNodeClick?: (node: MapNode) => void
  compact?: boolean
}

export function RunMap({ onNodeClick, compact }: Props) {
  const { runMap, currentFloor } = useRunStore()

  // 층별로 노드 그룹화
  const nodesByFloor = new Map<number, MapNode[]>()
  runMap.nodes.forEach(node => {
    if (!nodesByFloor.has(node.floor)) {
      nodesByFloor.set(node.floor, [])
    }
    nodesByFloor.get(node.floor)!.push(node)
  })

  const floors = Array.from(nodesByFloor.keys()).sort((a, b) => a - b)

  const handleNodeClick = (node: MapNode) => {
    // 현재 노드에서 연결된 노드만 클릭 가능
    const currentNode = runMap.nodes.find(n => n.id === runMap.currentNodeId)
    const isAccessible = currentNode?.connections.includes(node.id) && !node.completed

    if (isAccessible && onNodeClick) {
      onNodeClick(node)
    }
  }

  return (
    <div className={clsx(
      'bg-slate-900 rounded-lg p-4',
      compact ? 'max-h-60 overflow-y-auto' : 'h-full flex flex-col'
    )}>
      <div className="text-sm text-slate-400 mb-3 text-center">
        현재 {currentFloor}층 · 구역 {Math.ceil(currentFloor / 10)}
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
        {floors.map(floor => {
          const nodes = nodesByFloor.get(floor)!
          const isCurrentFloor = nodes.some(n => n.id === runMap.currentNodeId)

          return (
            <div
              key={floor}
              className={clsx(
                'flex items-center justify-center gap-3',
                isCurrentFloor && 'bg-slate-800/50 rounded-lg py-2 px-3'
              )}
            >
              <span className="text-xs text-slate-500 w-8 text-right shrink-0">{floor}F</span>
              <div className="flex gap-3 justify-center">
                {nodes.map(node => {
                  const isCurrent = node.id === runMap.currentNodeId
                  const isAccessible = runMap.nodes
                    .find(n => n.id === runMap.currentNodeId)
                    ?.connections.includes(node.id)

                  return (
                    <button
                      key={node.id}
                      className={clsx(
                        'transition-transform',
                        isAccessible && !node.completed && 'hover:scale-110 cursor-pointer',
                        !isAccessible && !isCurrent && 'cursor-default opacity-50'
                      )}
                      onClick={() => handleNodeClick(node)}
                      disabled={!isAccessible || node.completed}
                    >
                      <NodeIcon
                        type={node.type}
                        completed={node.completed}
                        current={isCurrent}
                        size={compact ? 'sm' : 'md'}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 연결선 렌더링 (고급 버전용)
export function RunMapWithConnections({ runMap: _runMap, onNodeClick }: { runMap: RunMapType; onNodeClick?: (node: MapNode) => void }) {
  // SVG로 연결선 그리기 (복잡도 때문에 기본 버전에서는 생략)
  return <RunMap onNodeClick={onNodeClick} />
}
