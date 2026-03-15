// src/engine/turnEngine.ts
// 턴 실행 로직 (순수 함수)

import type { PieceToken } from '@/types/game'
import {
  calculatePushDistance,
  calculateChainForce,
} from './collision'

/**
 * 우선권 굴리기: d6 + 민첩
 */
export function rollPriority(agility: number): number {
  const d6 = Math.floor(Math.random() * 6) + 1
  return d6 + agility
}

/**
 * 모든 기물 우선권 결정 → 내림차순 정렬
 */
export function determineTurnOrder(pieces: PieceToken[]): Array<{ piece: PieceToken; roll: number }> {
  return pieces
    .filter(p => !p.isDead && !p.isSealed)
    .map(p => ({ piece: p, roll: rollPriority(p.currentAgility) }))
    .sort((a, b) => b.roll - a.roll)
}

export interface CollisionEvent {
  attackerId: string
  targetId: string
  pushDistance: number
  direction: { dr: number; dc: number }
  chainForce: number
  targetDied: boolean // 그리드 밖으로 나감
}

/**
 * 단일 기물 이동 + 충돌 처리
 * 반환: 발생한 충돌 이벤트 목록
 */
export function resolvePieceMove(
  movingPiece: PieceToken,
  targetPosition: { row: number; col: number },
  allPieces: PieceToken[],
  boardSize: number,
  hasPenetrating: boolean // 관통 특성 여부
): CollisionEvent[] {
  const events: CollisionEvent[] = []

  // 이동 방향 계산
  const dr = Math.sign(targetPosition.row - movingPiece.position.row)
  const dc = Math.sign(targetPosition.col - movingPiece.position.col)

  // 이동 경로상 기물 확인
  const occupant = allPieces.find(
    p => p.position.row === targetPosition.row &&
         p.position.col === targetPosition.col &&
         !p.isDead
  )

  if (!occupant) return events // 빈 칸이면 충돌 없음

  // 충돌 처리
  const processCollision = (attacker: PieceToken, target: PieceToken, currentForce: number) => {
    // 고정대 특성이면 밀림 없음
    if (target.activeTraits.includes('고정대')) return

    const pushDist = calculatePushDistance(currentForce, target.currentMass)
    const finalRow = target.position.row + dr * pushDist
    const finalCol = target.position.col + dc * pushDist
    const died = finalRow < 0 || finalRow >= boardSize || finalCol < 0 || finalCol >= boardSize

    events.push({
      attackerId: attacker.instanceId,
      targetId: target.instanceId,
      pushDistance: pushDist,
      direction: { dr, dc },
      chainForce: calculateChainForce(currentForce, target.currentMass),
      targetDied: died,
    })

    // 반탄 특성: 공격자도 밀려남
    if (target.activeTraits.includes('반탄')) {
      const reflectDist = pushDist
      events.push({
        attackerId: target.instanceId,
        targetId: attacker.instanceId,
        pushDistance: reflectDist,
        direction: { dr: -dr, dc: -dc },
        chainForce: 0,
        targetDied: false, // 반탄은 즉사 없음 (별도 체크)
      })
    }

    // 연쇄 충돌
    const chainForce = calculateChainForce(currentForce, target.currentMass)
    if (chainForce > 0 && !hasPenetrating) {
      // 밀려난 위치에 다른 기물이 있으면 연쇄
      const chainTarget = allPieces.find(
        p => p.position.row === (target.position.row + dr) &&
             p.position.col === (target.position.col + dc) &&
             !p.isDead &&
             p.instanceId !== target.instanceId
      )
      if (chainTarget) {
        processCollision(target, chainTarget, chainForce)
      }
    }
  }

  processCollision(movingPiece, occupant, movingPiece.currentForce)
  return events
}
