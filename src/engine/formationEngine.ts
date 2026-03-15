// src/engine/formationEngine.ts
// 진형 효과 계산 (순수 함수)

import type { PieceToken, Formation } from '@/types/game'

export type FormationStatus = 'full' | 'partial' | 'broken'

/**
 * 진형 유지 여부 체크
 * 기물들의 현재 위치가 진형 패턴에 맞는지 확인
 * (초기 배치 위치와 비교)
 */
export function checkFormationMaintained(
  currentPieces: PieceToken[],
  initialPositions: Map<string, { row: number; col: number }>,
  totalSlots: number
): FormationStatus {
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
 * 진형 효과 강도 계산
 * full: 100%, partial: 50%, broken: 0%
 */
export function getFormationEffectMultiplier(status: FormationStatus): number {
  switch (status) {
    case 'full': return 1.0
    case 'partial': return 0.5
    case 'broken': return 0
  }
}

/**
 * 패시브 효과 적용: 기물 스탯 버프/디버프
 * 실제 효과는 Formation.effects 텍스트 기반
 */
export function applyFormationPassives(
  pieces: PieceToken[],
  _formation: Formation,
  maintainStatus: FormationStatus
): PieceToken[] {
  if (maintainStatus === 'broken') return pieces // 붕괴 시 효과 없음

  const multiplier = getFormationEffectMultiplier(maintainStatus)

  // 진형별 효과는 Formation 데이터의 effects 배열에서 읽어 적용
  // 실제 효과는 텍스트 기반이므로 진형 id별 하드코딩 or 파서 구현
  // 현재는 placeholder - 추후 구현

  return pieces.map(piece => {
    if (piece.owner !== 'player') return piece

    // 예시: 진형 유지 시 민첩 +1 (partial), +2 (full)
    const agilityBonus = maintainStatus === 'full' ? 2 : 1

    return {
      ...piece,
      currentAgility: piece.currentAgility + Math.floor(agilityBonus * multiplier),
    }
  })
}

/**
 * 진형 슬롯에서 코어 슬롯인지 확인
 */
export function isCoreSlot(
  formation: Formation,
  slotIndex: number
): boolean {
  return slotIndex < formation.coreSlots
}

/**
 * 진형 패턴 파싱 (그리드 문자열 → 2차원 배열)
 */
export function parseFormationPattern(pattern: string): string[][] {
  return pattern.trim().split('\n').map(row => row.trim().split(''))
}
