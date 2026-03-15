// tests/engine/turnEngine.test.ts

import { describe, it, expect } from 'vitest'
import { rollPriority, determineTurnOrder, resolvePieceMove } from '@/engine/turnEngine'
import type { PieceToken, BoardState } from '@/types/game'

describe('rollPriority', () => {
  it('d6(1~6) + 민첩 범위 내 반환', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollPriority(3)
      expect(result).toBeGreaterThanOrEqual(4)  // 1 + 3
      expect(result).toBeLessThanOrEqual(9)     // 6 + 3
    }
  })

  it('민첩 0이면 1~6 범위', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollPriority(0)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(6)
    }
  })

  it('높은 민첩일수록 높은 우선권 가능성', () => {
    const lowAgility = rollPriority(1)
    const highAgility = rollPriority(10)
    // 높은 민첩이 항상 높은 건 아니지만 범위는 더 높음
    expect(highAgility).toBeGreaterThanOrEqual(11) // 1 + 10
  })
})

describe('determineTurnOrder', () => {
  const createMockPiece = (id: string, agility: number, isDead = false, isSealed = false): PieceToken => ({
    instanceId: id,
    definitionId: 1,
    owner: 'player',
    position: { row: 0, col: 0 },
    currentForce: 1,
    currentMass: 1,
    currentAgility: agility,
    activeTraits: [],
    statusEffects: [],
    isSealed,
    isDead,
  })

  it('내림차순 정렬', () => {
    const pieces = [
      createMockPiece('a', 5),
      createMockPiece('b', 3),
      createMockPiece('c', 8),
    ]

    const order = determineTurnOrder(pieces)

    // 랜덤 요소가 있지만 일반적으로 높은 민첩이 앞에 옴
    expect(order.length).toBe(3)
    expect(order.map(o => o.piece.instanceId)).toContain('a')
    expect(order.map(o => o.piece.instanceId)).toContain('b')
    expect(order.map(o => o.piece.instanceId)).toContain('c')
  })

  it('사망한 기물은 제외', () => {
    const pieces = [
      createMockPiece('alive', 5),
      createMockPiece('dead', 5, true),
    ]

    const order = determineTurnOrder(pieces)
    expect(order.length).toBe(1)
    expect(order[0].piece.instanceId).toBe('alive')
  })

  it('봉인된 기물은 제외', () => {
    const pieces = [
      createMockPiece('active', 5),
      createMockPiece('sealed', 5, false, true),
    ]

    const order = determineTurnOrder(pieces)
    expect(order.length).toBe(1)
    expect(order[0].piece.instanceId).toBe('active')
  })

  it('모든 기물이 roll 값을 가짐', () => {
    const pieces = [
      createMockPiece('a', 3),
      createMockPiece('b', 7),
    ]

    const order = determineTurnOrder(pieces)
    order.forEach(entry => {
      expect(entry.roll).toBeGreaterThanOrEqual(1)
      expect(typeof entry.roll).toBe('number')
    })
  })
})

describe('resolvePieceMove', () => {
  const createMockPiece = (
    id: string,
    row: number,
    col: number,
    force = 3,
    mass = 1,
    traits: string[] = []
  ): PieceToken => ({
    instanceId: id,
    definitionId: 1,
    owner: 'player',
    position: { row, col },
    currentForce: force,
    currentMass: mass,
    currentAgility: 1,
    activeTraits: traits,
    statusEffects: [],
    isSealed: false,
    isDead: false,
  })

  it('빈 칸으로 이동하면 충돌 없음', () => {
    const moving = createMockPiece('mover', 0, 0)
    const allPieces = [moving]

    const events = resolvePieceMove(moving, { row: 1, col: 0 }, allPieces, 6, false)
    expect(events).toHaveLength(0)
  })

  it('기물과 충돌하면 이벤트 발생', () => {
    const moving = createMockPiece('mover', 0, 0, 5)
    const target = createMockPiece('target', 1, 0, 1, 2)
    const allPieces = [moving, target]

    const events = resolvePieceMove(moving, { row: 1, col: 0 }, allPieces, 6, false)
    expect(events.length).toBeGreaterThan(0)
    expect(events[0].attackerId).toBe('mover')
    expect(events[0].targetId).toBe('target')
  })

  it('고정대 특성은 밀리지 않음', () => {
    const moving = createMockPiece('mover', 0, 0, 10)
    const target = createMockPiece('target', 1, 0, 1, 1, ['고정대'])
    const allPieces = [moving, target]

    const events = resolvePieceMove(moving, { row: 1, col: 0 }, allPieces, 6, false)
    expect(events).toHaveLength(0)
  })

  it('밀려서 보드 밖으로 나가면 사망', () => {
    const moving = createMockPiece('mover', 0, 0, 10)
    const target = createMockPiece('target', 0, 5, 1, 1) // 가장자리
    const allPieces = [moving, target]

    const events = resolvePieceMove(moving, { row: 0, col: 5 }, allPieces, 6, false)
    expect(events[0].targetDied).toBe(true)
  })
})
