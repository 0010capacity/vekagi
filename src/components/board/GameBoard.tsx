// src/components/board/GameBoard.tsx
// 게임 보드 메인 컴포넌트

import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { useGameEngine } from '@/hooks/useGameEngine'
import { Cell } from './Cell'
import { MovePathOverlay } from './MovePathOverlay'

export function GameBoard() {
  const { board, selectedPieceId, pendingMoves } = useGameStore()
  const { previewMoves, previewPushResult } = useUIStore()
  const { handlePieceSelect, handleMoveReservation } = useGameEngine()

  const size = board.size
  const gridCols = size === 6 ? 'grid-cols-6' : size === 7 ? 'grid-cols-7' : 'grid-cols-8'
  const cellSize = 56 // w-14 = 56px (모바일), sm:w-16 = 64px (데스크톱)

  const handleCellClick = (pos: { row: number; col: number }) => {
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

  // 예약된 이동이 있는 기물 확인
  const getPendingMovePiece = (pieceId: string) => {
    return pendingMoves.find(m => m.pieceId === pieceId)
  }

  // 예약된 이동 경로 계산
  const movePaths = pendingMoves.map(pm => {
    const piece = board.pieces.flat().find(p => p?.instanceId === pm.pieceId)
    return piece ? { from: piece.position, to: pm.to, pieceId: pm.pieceId } : null
  }).filter(Boolean)

  return (
    <div className="relative">
      <div className={`grid ${gridCols} gap-1.5 p-3 bg-slate-900 rounded-xl`}>
        {board.tiles.map((row, r) =>
          row.map((tile, c) => {
            const piece = board.pieces[r]?.[c]
            const isHighlighted = previewMoves.some(m => m.row === r && m.col === c)
            const pushPreview = previewPushResult.get(`${r},${c}`)
            const isSelected = piece?.instanceId === selectedPieceId
            const hasPendingMove = piece ? !!getPendingMovePiece(piece.instanceId) : false

            return (
              <Cell
                key={`${r}-${c}`}
                position={{ row: r, col: c }}
                tileType={tile}
                piece={piece ?? undefined}
                isHighlighted={isHighlighted}
                pushPreview={pushPreview}
                isSelected={isSelected || hasPendingMove}
                onClick={() => handleCellClick({ row: r, col: c })}
              />
            )
          })
        )}
      </div>

      {/* 이동 경로 표시 */}
      <MovePathOverlay
        paths={movePaths}
        boardSize={size}
        cellSize={cellSize}
        gap={6} // gap-1.5 = 6px
        padding={12} // p-3 = 12px
      />
    </div>
  )
}
