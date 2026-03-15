# Phase 2 — 게임 엔진

> **이 단계에서 완료할 것:** 턴 엔진, 이동 엔진, 카운트다운, 진형 효과, 맵 생성기
> **선행 조건:** Phase 1 완료 (collision.ts 테스트 통과 상태)

---

## 체크리스트

- [ ] `src/engine/moveEngine.ts` — 이동 방식별 유효 이동 칸 계산
- [ ] `src/engine/turnEngine.ts` — 턴 실행 로직
- [ ] `src/engine/countdownEngine.ts` — 카운트다운 처리
- [ ] `src/engine/formationEngine.ts` — 진형 효과 계산
- [ ] `src/engine/mapGenerator.ts` — 런 맵 생성
- [ ] `tests/engine/turnEngine.test.ts` 작성 및 통과
- [ ] `.agent/progress.md` 업데이트

---

## src/engine/moveEngine.ts

이동 방식(MoveType)별로 유효한 이동 칸 목록을 반환하는 순수 함수.

```typescript
import type { PieceToken, Position, BoardState, MoveType } from '@/types/game'

export function getValidMoves(piece: PieceToken, board: BoardState, moveType: MoveType): Position[] {
  if (piece.isSealed) return []

  const { row, col } = piece.position
  const size = board.size
  const moves: Position[] = []

  const inBounds = (r: number, c: number) => r >= 0 && r < size && c >= 0 && c < size
  const isEmpty = (r: number, c: number) => inBounds(r, c) && board.pieces[r][c] === null

  switch (moveType) {
    case '주(主)': {
      // 상하좌우 1칸
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]]
      dirs.forEach(([dr, dc]) => {
        if (isEmpty(row+dr, col+dc)) moves.push({ row: row+dr, col: col+dc })
      })
      break
    }
    case '사(斜)': {
      // 대각선 1칸
      const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]]
      dirs.forEach(([dr, dc]) => {
        if (isEmpty(row+dr, col+dc)) moves.push({ row: row+dr, col: col+dc })
      })
      break
    }
    case '전(全)': {
      // 8방향 1칸
      const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
      dirs.forEach(([dr, dc]) => {
        if (isEmpty(row+dr, col+dc)) moves.push({ row: row+dr, col: col+dc })
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
      // L자 (체스 나이트). 기물 뛰어넘기 가능
      const jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]
      jumps.forEach(([dr, dc]) => {
        if (isEmpty(row+dr, col+dc)) moves.push({ row: row+dr, col: col+dc })
      })
      break
    }
    case '전진(↑)': {
      // 전방(위) 1칸만
      if (isEmpty(row-1, col)) moves.push({ row: row-1, col })
      break
    }
    case '역주(↓)': {
      // 후방(아래) 1칸만
      if (isEmpty(row+1, col)) moves.push({ row: row+1, col })
      break
    }
    case '돌진(⇒)': {
      // 4방향 중 선택한 방향으로 장애물/벽까지 직진
      // 반환값에는 각 방향의 최종 도달 가능 칸을 포함
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
      // 매 턴 랜덤 방향 1칸 (전(全)과 동일하게 반환, 실제 이동은 랜덤 선택)
      const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]
      dirs.forEach(([dr, dc]) => {
        if (isEmpty(row+dr, col+dc)) moves.push({ row: row+dr, col: col+dc })
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
```

---

## src/engine/turnEngine.ts

```typescript
import type { PieceToken, GameState, PendingMove } from '@/types/game'
import {
  calculatePushDistance,
  calculateChainForce,
  getCollisionDirection,
  calculateFinalPosition
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
  let force = movingPiece.currentForce

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

  processCollision(movingPiece, occupant, force)
  return events
}
```

---

## src/engine/countdownEngine.ts

```typescript
import type { PieceToken } from '@/types/game'

export interface CountdownEvent {
  pieceId: string
  type: 'awaken' | 'collapse' | 'summon' | 'seal_end'
  description: string
}

/**
 * 카운트다운 타이머 1 감소 + 0 도달 시 이벤트 생성
 */
export function tickCountdowns(pieces: PieceToken[]): {
  updatedPieces: PieceToken[]
  events: CountdownEvent[]
} {
  const events: CountdownEvent[] = []
  const updatedPieces = pieces.map(piece => {
    if (!piece.countdown) return piece

    const newTurns = piece.countdown.currentTurns - 1
    const updated = {
      ...piece,
      countdown: { ...piece.countdown, currentTurns: newTurns },
    }

    if (newTurns <= 0) {
      events.push({
        pieceId: piece.instanceId,
        type: piece.countdown.type === 'awaken' ? 'awaken'
            : piece.countdown.type === 'collapse' ? 'collapse'
            : piece.countdown.type === 'summon' ? 'summon'
            : 'seal_end',
        description: piece.countdown.description,
      })
    }

    return updated
  })

  return { updatedPieces, events }
}

/**
 * 봉인(seal) 타이머 감소
 */
export function tickSealedStatus(pieces: PieceToken[]): PieceToken[] {
  return pieces.map(piece => {
    const sealEffect = piece.statusEffects.find(e => e.type === 'sealed')
    if (!sealEffect) return piece

    const newTurns = sealEffect.remainingTurns - 1
    if (newTurns <= 0) {
      return {
        ...piece,
        isSealed: false,
        statusEffects: piece.statusEffects.filter(e => e.type !== 'sealed'),
      }
    }
    return {
      ...piece,
      statusEffects: piece.statusEffects.map(e =>
        e.type === 'sealed' ? { ...e, remainingTurns: newTurns } : e
      ),
    }
  })
}
```

---

## src/engine/formationEngine.ts

```typescript
import type { PieceToken, Formation, FormationEffect } from '@/types/game'

/**
 * 진형 유지 여부 체크
 * 기물들의 현재 위치가 진형 패턴에 맞는지 확인
 * (초기 배치 위치와 비교)
 */
export function checkFormationMaintained(
  currentPieces: PieceToken[],
  initialPositions: Map<string, { row: number; col: number }>,
  totalSlots: number
): 'full' | 'partial' | 'broken' {
  const alivePieces = currentPieces.filter(p => !p.isDead && p.owner === 'player')
  let maintained = 0

  alivePieces.forEach(p => {
    const initial = initialPositions.get(p.instanceId)
    if (!initial) return
    if (p.position.row === initial.row && p.position.col === initial.col) {
      maintained++
    }
  })

  const ratio = maintained / totalSlots
  if (ratio === 1) return 'full'
  if (ratio >= 0.5) return 'partial'
  return 'broken'
}

/**
 * 패시브 효과 적용: 기물 스탯 버프/디버프
 */
export function applyFormationPassives(
  pieces: PieceToken[],
  formation: Formation,
  maintainStatus: 'full' | 'partial' | 'broken'
): PieceToken[] {
  if (maintainStatus === 'broken') return pieces // 붕괴 시 효과 없음

  // 진형별 효과는 Formation 데이터의 effects 배열에서 읽어 적용
  // 실제 효과는 텍스트 기반이므로 진형 id별 하드코딩 or 파서 구현
  return pieces
}
```

---

## src/engine/mapGenerator.ts

```typescript
import type { MapNode, NodeType, RunMap } from '@/types/game'

const ZONE_FLOORS = { 1: 10, 2: 10, 3: 10 } // 구역당 층 수

/**
 * 런 맵 생성: 3구역 × 10층 + 보스 = 약 33~36 노드
 * Slay the Spire 방식의 분기 맵
 */
export function generateRunMap(): RunMap {
  const nodes: MapNode[] = []
  let nodeIdCounter = 0

  const makeId = () => `node_${nodeIdCounter++}`

  // 구역별 층 생성
  for (let zone = 1 as 1 | 2 | 3; zone <= 3; zone++) {
    for (let floor = 1; floor <= 10; floor++) {
      const absoluteFloor = (zone - 1) * 10 + floor
      const type = pickNodeType(zone, floor)
      nodes.push({
        id: makeId(),
        type,
        floor: absoluteFloor,
        zone,
        connections: [], // 아래서 연결
        completed: false,
      })
    }
    // 구역 보스
    nodes.push({
      id: makeId(),
      type: 'boss',
      floor: zone * 10,
      zone,
      connections: [],
      completed: false,
    })
  }

  // 최종 보스
  nodes.push({
    id: makeId(),
    type: 'boss',
    floor: 31,
    zone: 3,
    connections: [],
    completed: false,
  })

  // 분기 연결 생성 (각 노드에서 2~3개의 다음 노드 연결)
  connectNodes(nodes)

  return {
    nodes,
    currentNodeId: nodes[0].id,
  }
}

function pickNodeType(zone: number, floor: number): NodeType {
  if (floor === 10) return 'boss'

  const roll = Math.random()
  // 비율: 전투 55%, 정예 15%, 거점 10%, 상인 10%, 이벤트 10%
  if (roll < 0.55) return 'battle'
  if (roll < 0.70) return 'elite'
  if (roll < 0.80) return 'rest'
  if (roll < 0.90) return 'shop'
  return 'event'
}

function connectNodes(nodes: MapNode[]): void {
  // 층별로 그룹화 후 다음 층의 노드들과 연결
  const byFloor = new Map<number, MapNode[]>()
  nodes.forEach(n => {
    if (!byFloor.has(n.floor)) byFloor.set(n.floor, [])
    byFloor.get(n.floor)!.push(n)
  })

  const floors = Array.from(byFloor.keys()).sort((a, b) => a - b)
  floors.forEach((floor, idx) => {
    if (idx === floors.length - 1) return
    const current = byFloor.get(floor)!
    const next = byFloor.get(floors[idx + 1])!

    current.forEach(node => {
      // 각 노드에서 다음 층 1~2개 노드로 연결
      const count = Math.min(next.length, 1 + Math.floor(Math.random() * 2))
      const shuffled = [...next].sort(() => Math.random() - 0.5)
      node.connections = shuffled.slice(0, count).map(n => n.id)
    })
  })
}
```

---

## 테스트

```typescript
// tests/engine/turnEngine.test.ts
import { describe, it, expect } from 'vitest'
import { rollPriority, determineTurnOrder } from '@/engine/turnEngine'

describe('rollPriority', () => {
  it('d6(1~6) + 민첩 범위 내 반환', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollPriority(3)
      expect(result).toBeGreaterThanOrEqual(4)  // 1 + 3
      expect(result).toBeLessThanOrEqual(9)     // 6 + 3
    }
  })
})

describe('determineTurnOrder', () => {
  it('내림차순 정렬', () => {
    // 여러 기물 mock 후 우선권 순서 확인
    // 실제 구현 시 mock PieceToken 사용
  })
})
```

---

## 완료 후

`.agent/progress.md` 에 추가:
```
## Phase 2 완료

완료 파일:
- src/engine/moveEngine.ts ✓
- src/engine/turnEngine.ts ✓
- src/engine/countdownEngine.ts ✓
- src/engine/formationEngine.ts ✓
- src/engine/mapGenerator.ts ✓
- tests/engine/turnEngine.test.ts ✓

다음 단계: phase_03_ai.md
```
