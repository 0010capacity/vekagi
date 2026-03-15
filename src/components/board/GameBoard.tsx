// src/components/board/GameBoard.tsx
// 게임 보드 메인 컴포넌트

import { useRef, useEffect, useState } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { useGameEngine } from '@/hooks/useGameEngine'
import { Cell } from './Cell'
import type { Position, MoveReservation } from '@/types/game'

interface CellMetrics {
  cellSize: number
  gap: number
  padding: number
  boardWidth: number
  boardHeight: number
}

export function GameBoard() {
  const { board, selectedPieceId, pendingMoves } = useGameStore()
  const { previewMoves, previewPushResult } = useUIStore()
  const { handlePieceSelect, handleMoveReservation } = useGameEngine()

  const containerRef = useRef<HTMLDivElement>(null)
  const [metrics, setMetrics] = useState<CellMetrics | null>(null)

  const size = board.size
  const gridCols = size === 6 ? 'grid-cols-6' : size === 7 ? 'grid-cols-7' : 'grid-cols-8'

  // 실제 렌더링된 크기 측정
  useEffect(() => {
    const updateMetrics = () => {
      if (!containerRef.current) return

      const container = containerRef.current
      const firstCell = container.querySelector('[data-cell]')

      if (!firstCell) return

      const containerRect = container.getBoundingClientRect()
      const cellRect = firstCell.getBoundingClientRect()

      // 셀 크기와 간격 계산
      const cellSize = cellRect.width
      const gap = 6 // gap-1.5 = 0.375rem ≈ 6px
      const padding = 12 // p-3 = 0.75rem ≈ 12px

      setMetrics({
        cellSize,
        gap,
        padding,
        boardWidth: containerRect.width,
        boardHeight: containerRect.height,
      })
    }

    updateMetrics()

    // 리사이즈 시 다시 계산
    window.addEventListener('resize', updateMetrics)
    return () => window.removeEventListener('resize', updateMetrics)
  }, [])

  const handleCellClick = (pos: Position) => {
    const piece = board.pieces[pos.row]?.[pos.col]

    if (piece?.owner === 'player' && !piece.isDead) {
      // 토글: 이미 선택된 기물이면 해제, 아니면 선택
      if (selectedPieceId === piece.instanceId) {
        handlePieceSelect(null)
      } else {
        handlePieceSelect(piece.instanceId)
      }
    } else if (selectedPieceId && previewMoves.some(m => m.row === pos.row && m.col === pos.col)) {
      // 이동 예약
      handleMoveReservation(selectedPieceId, pos)
      handlePieceSelect(null)
    }
  }

  // 예약된 이동 경로 계산
  const movePaths: Array<{ from: Position; to: Position }> = pendingMoves.map(pm => {
    // 현재 기물 위치 찾기 (이동 전)
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const piece = board.pieces[r]?.[c]
        if (piece?.instanceId === pm.pieceId) {
          return { from: { row: r, col: c }, to: pm.to }
        }
      }
    }
    return null
  }).filter((p): p is { from: Position; to: Position } | null => p !== null)

  // 셀 중심 좌표 계산
  const getCellCenter = (pos: Position): { x: number; y: number } => {
    if (!metrics) return { x: 0, y: 0 }
    const { cellSize, gap, padding } = metrics
    return {
      x: padding + pos.col * (cellSize + gap) + cellSize / 2,
      y: padding + pos.row * (cellSize + gap) + cellSize / 2,
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className={`grid ${gridCols} gap-1.5 p-3 bg-slate-900 rounded-xl`}>
        {board.tiles.map((row, r) =>
          row.map((tile, c) => {
            const piece = board.pieces[r]?.[c]
            const isHighlighted = previewMoves.some(m => m.row === r && m.col === c)
            const pushPreview = previewPushResult.get(`${r},${c}`)
            const isSelected = piece?.instanceId === selectedPieceId
            const hasPendingMove = piece ? pendingMoves.some(m => m.pieceId === piece.instanceId) : false

            return (
              <div key={`${r}-${c}`} data-cell>
                <Cell
                  tileType={tile}
                  piece={piece ?? undefined}
                  isHighlighted={isHighlighted}
                  pushPreview={pushPreview}
                  isSelected={isSelected}
                  hasPendingMove={hasPendingMove}
                  onClick={() => handleCellClick({ row: r, col: c })}
                />
              </div>
            )
          })
        })
      </div>

      {/* 이동 경로 SVG 오버레이 */}
      {metrics && movePaths.length > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#60A5FA" />
            </marker>
          </defs>

          {movePaths.map((path, index) => {
            if (!path) return null
            const from = getCellCenter(path.from)
            const to = getCellCenter(path.to)

            return (
              <line
                key={`path-${index}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#60A5FA"
                strokeWidth="3"
                strokeDasharray="8 4"
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
              />
            )
          })}
        </svg>
      )}
    </div>
  )
}
