// src/engine/moveEngine.ts
// 이동 방식별 유효 이동 칸 계산 (순수 함수)

import type { PieceToken, Position, BoardState, MoveType } from '@/types/game'

export function getValidMoves(piece: PieceToken, board: BoardState, moveType: MoveType): Position[] {
  if (piece.isSealed) return []

  const { row, col } = piece.position
  const size = board.size
  const moves: Position[] = []

  const inBounds = (r: number, c: number) => r >= 0 && r < size && c >= 0 && c < size
  // 충돌 가능하므로 기물이 있어도 이동 가능
  const canMoveTo = (r: number, c: number) => inBounds(r, c)

  switch (moveType) {
    case '주(主)': {
      // 상하좌우 1칸 - 충돌 가능
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
      dirs.forEach(([dr, dc]) => {
        if (canMoveTo(row+dr, col+dc)) moves.push({ row: row+dr, col: col+dc })
      })
      break
    }
    case '사(斜)': {
      // 대각선 1칸 - 충돌 가능
      const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]]
      dirs.forEach(([dr, dc]) => {
        if (canMoveTo(row+dr, col+dc)) moves.push({ row: row+dr, col: col+dc })
      })
      break
    }
    case '전(全)': {
      // 8방향 1칸 - 충돌 가능
      const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
      dirs.forEach(([dr, dc]) => {
        if (canMoveTo(row+dr, col+dc)) moves.push({ row: row+dr, col: col+dc })
      })
      break
    }
    case '십자(十)': {
      // 상하좌우 최대 3칸 (중간에 기물 있으면 막힘)
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
      dirs.forEach(([dr, dc]) => {
        for (let i = 1; i <= 3; i++) {
          const nr = row + dr*i, nc = col + dc*i
          if (!inBounds(nr, nc)) break
          if (board.pieces[nr][nc]) break
          moves.push({ row: nr, col: nc })
        }
      })
      break
    }
    case '사선(╲)': {
      // 대각 최대 3칸
      const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]]
      dirs.forEach(([dr, dc]) => {
        for (let i = 1; i <= 3; i++) {
          const nr = row + dr*i, nc = col + dc*i
          if (!inBounds(nr, nc)) break
          if (board.pieces[nr][nc]) break
          moves.push({ row: nr, col: nc })
        }
      })
      break
    }
    case '도약(♞)': {
      // L자 (체스 나이트). 기물 뛰어넘기 가능, 충돌 가능
      const jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]
      jumps.forEach(([dr, dc]) => {
        if (canMoveTo(row+dr, col+dc)) moves.push({ row: row+dr, col: col+dc })
      })
      break
    }
    case '전진(↑)': {
      // 전방(위) 1칸만 - 충돌 가능
      if (canMoveTo(row-1, col)) moves.push({ row: row-1, col })
      break
    }
    case '역주(↓)': {
      // 후방(아래) 1칸만 - 충돌 가능
      if (canMoveTo(row+1, col)) moves.push({ row: row+1, col })
      break
    }
    case '돌진(⇒)': {
      // 4방향 중 선택한 방향으로 장애물/벽까지 직진
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
      dirs.forEach(([dr, dc]) => {
        for (let i = 1; i < size; i++) {
          const nr = row + dr*i, nc = col + dc*i
          if (!inBounds(nr, nc)) break
          if (board.pieces[nr][nc]) break
          moves.push({ row: nr, col: nc })
        }
      })
      break
    }
    case '고정(■)': {
      // 이동 불가
      break
    }
    case '랜덤(?)': {
      // 매 턴 랜덤 방향 1칸 (전(全)과 동일하게 반환, 충돌 가능)
      const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
      dirs.forEach(([dr, dc]) => {
        if (canMoveTo(row+dr, col+dc)) moves.push({ row: row+dr, col: col+dc })
      })
      break
    }
  }

  return moves
}

/**
 * 랜덤(?) 이동: 유효 이동 목록에서 무작위 1개 선택
 */
export function pickRandomMove(validMoves: Position[]): Position | null {
  if (validMoves.length === 0) return null
  return validMoves[Math.floor(Math.random() * validMoves.length)]
}
