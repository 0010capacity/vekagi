// src/components/board/MovePathOverlay.tsx
// 이동 경로 표시 오버레이

import type { Position } from '@/types/game'

interface MovePath {
  from: Position
  to: Position
  pieceId: string
}

interface Props {
  paths: (MovePath | null)[]
  boardSize: number
  cellSize: number
  gap: number
  padding: number
}

export function MovePathOverlay({ paths, boardSize, cellSize, gap, padding }: Props) {
  if (paths.length === 0) return null

  const cellTotal = cellSize + gap
  const svgWidth = padding * 2 + boardSize * cellTotal - gap
  const svgHeight = padding * 2 + boardSize * cellTotal - gap

  const getCellCenter = (pos: Position) => ({
    x: padding + pos.col * cellTotal + cellSize / 2,
    y: padding + pos.row * cellTotal + cellSize / 2,
  })

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={svgWidth}
      height={svgHeight}
      style={{ overflow: 'visible' }}
    >
      {paths.filter(Boolean).map((path, index) => {
        if (!path) return null
        const from = getCellCenter(path.from)
        const to = getCellCenter(path.to)

        return (
          <g key={path.pieceId}>
            {/* 경로 선 (점선) */}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#60A5FA"
              strokeWidth="3"
              strokeDasharray="8 4"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* 화살표 머리 */}
            <polygon
              points={getArrowPoints(to.x, to.y, from.x, from.y)}
              fill="#60A5FA"
              opacity="0.8"
            />
            {/* 도착점 원 */}
            <circle
              cx={to.x}
              cy={to.y}
              r="8"
              fill="none"
              stroke="#60A5FA"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          </g>
        )
      })}
    </svg>
  )
}

function getArrowPoints(toX: number, toY: number, fromX: number, fromY: number): string {
  const angle = Math.atan2(toY - fromY, toX - fromX)
  const arrowSize = 10

  const tipX = toX - Math.cos(angle) * 12
  const tipY = toY - Math.sin(angle) * 12

  const leftX = tipX - Math.cos(angle - Math.PI / 6) * arrowSize
  const leftY = tipY - Math.sin(angle - Math.PI / 6) * arrowSize
  const rightX = tipX - Math.cos(angle + Math.PI / 6) * arrowSize
  const rightY = tipY - Math.sin(angle + Math.PI / 6) * arrowSize

  return `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`
}
