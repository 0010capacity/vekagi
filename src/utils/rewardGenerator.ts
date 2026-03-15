// src/utils/rewardGenerator.ts
// 층 클리어 보상 생성

import type { PieceDefinition, Formation } from '@/types/game'
import { PIECES } from '@/data/pieces'
import { FORMATIONS } from '@/data/formations'

export type RewardOption =
  | { type: 'piece'; piece: PieceDefinition }
  | { type: 'formation'; formation: Formation }
  | { type: 'heal'; amount: number }
  | { type: 'currency'; currencyType: string; amount: number }

export function generateRewardOptions(
  zone: 1 | 2 | 3,
  isElite: boolean,
  ownedPieceIds: number[] = [],
  ownedFormationIds: number[] = []
): RewardOption[] {
  const options: RewardOption[] = []

  // 등급 풀 결정 (진형용)
  const rarityPool = isElite
    ? ['희귀', '전설']
    : zone === 1
      ? ['기본', '고급']
      : zone === 2
        ? ['고급', '희귀']
        : ['희귀', '전설']

  // 기물 픽 (보유하지 않은 것 중에서, 전사형/지원형)
  const availablePieces = PIECES.filter(
    p => !ownedPieceIds.includes(p.id) &&
         ['전사형', '지원형'].includes(p.category)
  )

  if (availablePieces.length > 0) {
    const randomPiece = availablePieces[Math.floor(Math.random() * availablePieces.length)]
    options.push({ type: 'piece', piece: randomPiece })
  }

  // 회복 옵션
  const healAmount = zone === 1 ? 3 : zone === 2 ? 4 : 5
  options.push({ type: 'heal', amount: healAmount })

  // 진형 카드 (보유하지 않은 것 중에서)
  const availableFormations = FORMATIONS.filter(
    f => !ownedFormationIds.includes(f.id) &&
         rarityPool.includes(f.rarity)
  )

  if (availableFormations.length > 0) {
    const randomFormation = availableFormations[Math.floor(Math.random() * availableFormations.length)]
    options.push({ type: 'formation', formation: randomFormation })
  }

  // 화폐 보상 (엘리트/보스 전투 시)
  if (isElite) {
    options.push({ type: 'currency', currencyType: '정예결정', amount: 1 })
  } else {
    options.push({ type: 'currency', currencyType: '전투결정', amount: zone * 2 })
  }

  // 최대 4개 반환, 섞어서
  return options
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
}

// 보스 보상 (특별)
export function generateBossReward(_zone: 1 | 2 | 3): RewardOption[] {
  const options: RewardOption[] = []

  // 랜덤 기물
  if (PIECES.length > 0) {
    const randomPiece = PIECES[Math.floor(Math.random() * PIECES.length)]
    options.push({ type: 'piece', piece: randomPiece })
  }

  // 전설 진형
  const legendaryFormations = FORMATIONS.filter(f => f.rarity === '전설')
  if (legendaryFormations.length > 0) {
    const randomFormation = legendaryFormations[Math.floor(Math.random() * legendaryFormations.length)]
    options.push({ type: 'formation', formation: randomFormation })
  }

  // 공허파편
  options.push({ type: 'currency', currencyType: '공허파편', amount: 1 })

  // 완전 회복
  options.push({ type: 'heal', amount: 999 })

  return options
}
