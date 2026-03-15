// src/engine/countdownEngine.ts
// 카운트다운 처리 (순수 함수)

import type { PieceToken, StatusEffect } from '@/types/game'

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

/**
 * 기물에 상태 효과 추가
 */
export function addStatusEffect(piece: PieceToken, effect: StatusEffect): PieceToken {
  const existing = piece.statusEffects.find(e => e.type === effect.type)
  if (existing) {
    // 기존 효과 갱신 (더 긴 지속시간 or 더 큰 값)
    return {
      ...piece,
      statusEffects: piece.statusEffects.map(e =>
        e.type === effect.type
          ? {
              ...e,
              value: Math.max(e.value, effect.value),
              remainingTurns: Math.max(e.remainingTurns, effect.remainingTurns),
            }
          : e
      ),
    }
  }
  return {
    ...piece,
    statusEffects: [...piece.statusEffects, effect],
  }
}
