// src/utils/eventEffectParser.ts
// 이벤트 효과 문자열 파싱 및 적용

import { useRunStore } from '@/stores/runStore'
import { PIECES } from '@/data/pieces'
import { FORMATIONS } from '@/data/formations'

export interface EventEffectResult {
  success: boolean
  message: string
  pieceGained?: string
  formationGained?: string
}

export function applyEventEffect(effectText: string): EventEffectResult {
  const run = useRunStore.getState()
  const result: EventEffectResult = { success: true, message: '' }

  // 지휘관 HP 변화
  const hpMatch = effectText.match(/지휘관 HP ([+-]\d+)/)
  if (hpMatch) {
    const amount = parseInt(hpMatch[1])
    if (amount > 0) {
      run.healCommander(amount)
      result.message = `지휘관 HP +${amount}`
    } else {
      run.damageCommander(-amount)
      result.message = `지휘관 HP ${amount}`
    }
  }

  // 최대 HP 변화 (영구)
  const maxHpMatch = effectText.match(/최대 HP ([+-]\d+)/)
  if (maxHpMatch) {
    const amount = parseInt(maxHpMatch[1])
    if (amount > 0) {
      run.increaseMaxHP(amount)
      result.message += ` 최대 HP +${amount}`
    }
    // 음수면 현재 체력도 감소 (increaseMaxHP가 자동 처리)
  }

  // 기물 획득 (랜덤) - 등급 필터링 없이 랜덤 선택
  if (effectText.includes('기물') && effectText.includes('획득')) {
    const ownedIds = run.ownedPieces.map(p => p.id)
    const pool = PIECES.filter(p => !ownedIds.includes(p.id))

    if (pool.length > 0) {
      const randomPiece = pool[Math.floor(Math.random() * pool.length)]
      run.addPiece(randomPiece)
      result.pieceGained = randomPiece.name
      result.message += ` 기물 획득: ${randomPiece.name}`
    }
  }

  // 진형 카드 획득
  if (effectText.includes('진형') && (effectText.includes('획득') || effectText.includes('카드'))) {
    let pool = FORMATIONS
    if (effectText.includes('고급 이하')) {
      pool = FORMATIONS.filter(f => ['기본', '고급'].includes(f.rarity))
    } else if (effectText.includes('희귀')) {
      pool = FORMATIONS.filter(f => f.rarity === '희귀')
    } else if (effectText.includes('전설')) {
      pool = FORMATIONS.filter(f => f.rarity === '전설')
    }

    if (pool.length > 0) {
      const randomFormation = pool[Math.floor(Math.random() * pool.length)]
      run.addFormation(randomFormation)
      result.formationGained = randomFormation.name
      result.message += ` 진형 획득: ${randomFormation.name}`
    }
  }

  // 화폐 획득
  const currencyMatch = effectText.match(/전투결정.*?(\d+)/)
  if (currencyMatch) {
    run.addCurrency('전투결정', parseInt(currencyMatch[1]))
    result.message += ` 전투결정 +${currencyMatch[1]}`
  }

  const eliteCurrencyMatch = effectText.match(/정예결정.*?(\d+)/)
  if (eliteCurrencyMatch) {
    run.addCurrency('정예결정', parseInt(eliteCurrencyMatch[1]))
    result.message += ` 정예결정 +${eliteCurrencyMatch[1]}`
  }

  const voidMatch = effectText.match(/공허파편.*?(\d+)/)
  if (voidMatch) {
    run.addCurrency('공허파편', parseInt(voidMatch[1]))
    result.message += ` 공허파편 +${voidMatch[1]}`
  }

  // 아무 일도 없음
  if (effectText.includes('아무 일도')) {
    result.message = '아무 일도 일어나지 않았다.'
  }

  return result
}

// 위험도에 따른 색상 반환
export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'none':
      return 'text-slate-300 border-slate-600'
    case 'low':
      return 'text-emerald-300 border-emerald-700'
    case 'medium':
      return 'text-amber-300 border-amber-700'
    case 'high':
      return 'text-red-300 border-red-700'
    case 'extreme':
      return 'text-purple-300 border-purple-700'
    default:
      return 'text-slate-300 border-slate-600'
  }
}
