import { describe, it, expect } from 'vitest'
import { calculatePushDistance, calculateChainForce } from '@/engine/collision'

describe('calculatePushDistance', () => {
  it('항상 최소 1칸 밀림', () => {
    expect(calculatePushDistance(1, 10)).toBe(1)
    expect(calculatePushDistance(1, 5)).toBe(1)
    expect(calculatePushDistance(2, 5)).toBe(1)
  })

  it('힘이 질량을 초과하면 추가 밀림', () => {
    expect(calculatePushDistance(4, 2)).toBe(3)  // 1 + (4-2)
    expect(calculatePushDistance(5, 1)).toBe(5)  // 1 + (5-1)
    expect(calculatePushDistance(3, 1)).toBe(3)  // 1 + (3-1)
  })

  it('힘 = 질량이면 1칸', () => {
    expect(calculatePushDistance(3, 3)).toBe(1)
    expect(calculatePushDistance(5, 5)).toBe(1)
  })
})

describe('calculateChainForce', () => {
  it('전달 힘 = 공격자 힘 - 피격자 질량', () => {
    expect(calculateChainForce(5, 2)).toBe(3)
    expect(calculateChainForce(3, 3)).toBe(0)
    expect(calculateChainForce(2, 4)).toBe(-2)
  })

  it('0 이하면 연쇄 종료 신호', () => {
    expect(calculateChainForce(3, 3) <= 0).toBe(true)
    expect(calculateChainForce(2, 4) <= 0).toBe(true)
  })

  it('양수면 연쇄 계속 신호', () => {
    expect(calculateChainForce(5, 2) > 0).toBe(true)
  })
})
