// src/components/modals/ShopModal.tsx
// 상점 모달

import { useState } from 'react'
import { SHOP } from '@/data/shop'
import { useUIStore } from '@/stores/uiStore'
import { useRunStore } from '@/stores/runStore'
import { PIECES } from '@/data/pieces'
import { FORMATIONS } from '@/data/formations'
import type { Currencies } from '@/types/game'

// 비용 파싱
function parseCost(cost: string): { currency: keyof Currencies | '무료'; amount: number } | null {
  const match = cost.match(/(전투결정|정예결정|공허파편)\s*[×x](\d+)/i)
  if (match) {
    return { currency: match[1] as keyof Currencies, amount: parseInt(match[2]) }
  }
  if (cost === '무료') {
    return { currency: '무료', amount: 0 }
  }
  return null
}

// 비용 지불 가능 여부
function canAfford(cost: string, currencies: Currencies): boolean {
  const parsed = parseCost(cost)
  if (!parsed) return false
  if (parsed.currency === '무료') return true
  return (currencies[parsed.currency] ?? 0) >= parsed.amount
}

export function ShopModal() {
  const { closeModal, setScreen } = useUIStore()
  const run = useRunStore()
  const [message, setMessage] = useState<string | null>(null)
  const [isFreeShop, setIsFreeShop] = useState(false)

  const handlePurchase = (item: typeof SHOP.categories[0]['items'][0]) => {
    const parsed = parseCost(item.cost)
    if (!parsed) {
      setMessage('구매할 수 없습니다.')
      return
    }

    // 무료 체크
    if (parsed.currency !== '무료') {
      if (!canAfford(item.cost, run.currencies)) {
        setMessage('화폐가 부족합니다.')
        return
      }
      // 비용 차감
      run.spendCurrency(parsed.currency as keyof typeof run.currencies, parsed.amount)
    }

    // 효과 적용
    applyItemEffect(item)
    setMessage(`${item.name} 구매 완료!`)
  }

  const applyItemEffect = (item: typeof SHOP.categories[0]['items'][0]) => {
    const desc = item.desc

    // 지휘관 치유
    if (desc.includes('지휘관 HP +3')) run.healCommander(3)
    else if (desc.includes('지휘관 HP +5')) run.healCommander(5)
    else if (desc.includes('지휘관 HP +7')) run.healCommander(7)
    else if (desc.includes('지휘관 HP 완전 회복')) run.healCommander(999)
    else if (desc.includes('최대 HP +3')) run.increaseMaxHP(3)

    // 기물 획득 (랜덤) - 등급 필터링 없이 랜덤 선택
    else if (desc.includes('기물') && desc.includes('선택')) {
      // 보유하지 않은 기물 중에서 선택
      const ownedIds = run.ownedPieces.map(p => p.id)
      const pool = PIECES.filter(p => !ownedIds.includes(p.id))

      if (pool.length > 0) {
        const randomPiece = pool[Math.floor(Math.random() * pool.length)]
        run.addPiece(randomPiece)
      }
    }

    // 진형 획득 (랜덤)
    else if (desc.includes('진형') && desc.includes('선택')) {
      const ownedIds = run.ownedFormations.map(f => f.id)
      let pool = FORMATIONS.filter(f => !ownedIds.includes(f.id))
      if (desc.includes('고급 이하')) pool = pool.filter(f => ['기본', '고급'].includes(f.rarity))
      else if (desc.includes('희귀 이하')) pool = pool.filter(f => ['기본', '고급', '희귀'].includes(f.rarity))
      else if (desc.includes('전설')) pool = pool.filter(f => f.rarity === '전설')

      if (pool.length > 0) {
        const randomFormation = pool[Math.floor(Math.random() * pool.length)]
        run.addFormation(randomFormation)
      }
    }
  }

  const handleLeave = () => {
    closeModal()
    run.completeCurrentNode()
    setScreen('run_map')
  }

  // 거점(무료) 카테고리 필터링
  const categories = SHOP.categories.filter(c => isFreeShop ? c.nodeType === 'free' : c.nodeType !== 'free')

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-auto py-8">
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{isFreeShop ? '거점' : '상인'}</h3>
          <div className="flex gap-3 text-sm">
            <span className="text-yellow-400">◆ {run.currencies.전투결정}</span>
            <span className="text-blue-400">◈ {run.currencies.정예결정}</span>
            <span className="text-purple-400">✦ {run.currencies.공허파편}</span>
          </div>
        </div>

        {/* 거점/상점 토글 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setIsFreeShop(false)}
            className={`px-3 py-1 text-sm rounded ${!isFreeShop ? 'bg-blue-700 text-white' : 'bg-slate-700 text-slate-400'}`}
          >
            상점
          </button>
          <button
            onClick={() => setIsFreeShop(true)}
            className={`px-3 py-1 text-sm rounded ${isFreeShop ? 'bg-blue-700 text-white' : 'bg-slate-700 text-slate-400'}`}
          >
            거점 (무료)
          </button>
        </div>

        {message && (
          <div className="bg-emerald-900/50 text-emerald-300 text-sm px-3 py-2 rounded mb-4">
            {message}
          </div>
        )}

        {categories.map(cat => (
          <div key={cat.name} className="mb-6">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              {cat.name}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {cat.items.map((item, i) => {
                const affordable = canAfford(item.cost, run.currencies)
                return (
                  <button
                    key={i}
                    onClick={() => handlePurchase(item)}
                    disabled={!affordable}
                    className={`text-left rounded-lg p-3 transition-colors ${
                      affordable
                        ? 'bg-slate-700/50 hover:bg-slate-700 cursor-pointer'
                        : 'bg-slate-800/50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-semibold text-sm text-white">{item.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                    <div className={`text-xs mt-2 ${
                      item.cost === '무료' ? 'text-emerald-400' : 'text-yellow-400'
                    }`}>
                      {item.cost}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <button
          onClick={handleLeave}
          className="w-full py-2 text-slate-400 hover:text-white text-sm border border-slate-600 rounded-lg transition-colors"
        >
          떠나기
        </button>
      </div>
    </div>
  )
}
