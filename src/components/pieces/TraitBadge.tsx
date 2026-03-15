// src/components/pieces/TraitBadge.tsx
// 특성 뱃지 컴포넌트

interface Props {
  trait: string
}

function getTraitColor(trait: string): string {
  // 위험/패널티 특성
  if (['양날의검', '무른', '순교자', '폭사', '자폭'].some(t => trait.includes(t)))
    return 'bg-red-900/60 text-red-300 border-red-800'
  // 충돌/방어 관련
  if (['관통', '반탄', '고정대', '가시', '철벽'].some(t => trait.includes(t)))
    return 'bg-orange-900/60 text-orange-300 border-orange-800'
  // 버프 관련
  if (['고취', '방벽', '가속', '강화', '회복'].some(t => trait.includes(t)))
    return 'bg-emerald-900/60 text-emerald-300 border-emerald-800'
  // 디버프 관련
  if (['교란', '약화', '둔화', '저주'].some(t => trait.includes(t)))
    return 'bg-purple-900/60 text-purple-300 border-purple-800'
  // 카운트다운 관련
  if (['각성', '붕괴', '소환', '봉인', '잠복'].some(t => trait.includes(t)))
    return 'bg-amber-900/60 text-amber-300 border-amber-800'
  // 기본
  return 'bg-slate-700 text-slate-300 border-slate-600'
}

export function TraitBadge({ trait }: Props) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTraitColor(trait)}`}>
      {trait}
    </span>
  )
}
