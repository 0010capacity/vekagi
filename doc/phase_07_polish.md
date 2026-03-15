# Phase 7 — 통합 & 마무리

> **이 단계에서 완료할 것:** 전체 게임 플로우 연결, E2E 테스트, 배포 설정
> **선행 조건:** Phase 6 완료

---

## 체크리스트

- [ ] 전체 게임 플로우 수동 검증 (메인메뉴 → 기물픽 → 맵 → 진형 → 전투 → 보상 → 반복)
- [ ] 지휘관 HP 감소 로직 연결
- [ ] 보스전 페이즈 전환 로직 연결
- [ ] 층 클리어 보상 시스템 연결
- [ ] 상인/이벤트 효과 파싱 구현
- [ ] `tests/e2e/` E2E 테스트 작성
- [ ] 모바일 반응형 검증
- [ ] Cloudflare Pages 배포 설정
- [ ] `.agent/progress.md` 최종 업데이트

---

## 1. 지휘관 HP 감소 연결

`useGameEngine.ts` 의 `handleEndTurn` 에서 기물 사망 감지:

```typescript
// 사망한 플레이어 기물 처리
const newlyDeadPlayers = updatedPieces.filter(
  p => p.owner === 'player' && p.isDead &&
       !previousDeadIds.has(p.instanceId)
)

for (const dead of newlyDeadPlayers) {
  const def = PIECES.find(p => p.id === dead.definitionId)
  if (!def) continue

  let hpDamage = 1 // 기본
  if (def.traits.includes('양날의검')) hpDamage = 2
  if (def.traits.includes('무른')) hpDamage = 0
  if (def.traits.includes('순교자')) hpDamage = -1 // 회복

  run.damageCommander(hpDamage)
  run.recordDeath(def.id)
}
```

---

## 2. 층 클리어 보상 시스템

```typescript
// src/utils/rewardGenerator.ts
import type { PieceDefinition, Formation } from '@/types/game'
import { PIECES } from '@/data/pieces'
import { FORMATIONS } from '@/data/formations'

export type RewardOption =
  | { type: 'piece'; piece: PieceDefinition }
  | { type: 'formation'; formation: Formation }
  | { type: 'heal'; amount: number }
  | { type: 'currency'; currencyType: string; amount: number }

export function generateRewardOptions(zone: 1 | 2 | 3, isElite: boolean): RewardOption[] {
  const options: RewardOption[] = []
  const rarityPool = isElite
    ? ['희귀', '전설']
    : zone === 1 ? ['기본', '고급'] : zone === 2 ? ['고급', '희귀'] : ['희귀', '전설']

  // 기물 픽
  const piecePick = PIECES
    .filter(p => ['전사형', '지원형'].includes(p.category))
    .sort(() => Math.random() - 0.5)[0]
  if (piecePick) options.push({ type: 'piece', piece: piecePick })

  // 회복
  options.push({ type: 'heal', amount: zone === 1 ? 3 : zone === 2 ? 4 : 5 })

  // 진형 카드
  const formationPick = FORMATIONS
    .filter(f => rarityPool.includes(f.rarity))
    .sort(() => Math.random() - 0.5)[0]
  if (formationPick) options.push({ type: 'formation', formation: formationPick })

  return options.slice(0, 3)
}
```

---

## 3. 이벤트 효과 파싱

이벤트 효과 문자열을 파싱하여 실제 스토어 액션으로 변환:

```typescript
// src/utils/eventEffectParser.ts
import { useRunStore } from '@/stores/runStore'
import { PIECES } from '@/data/pieces'

export function applyEventEffect(effectText: string) {
  const run = useRunStore.getState()

  // 지휘관 HP 변화
  const hpMatch = effectText.match(/지휘관 HP ([+-]\d+)/)
  if (hpMatch) {
    const amount = parseInt(hpMatch[1])
    if (amount > 0) run.healCommander(amount)
    else run.damageCommander(-amount)
  }

  // 기물 획득 (랜덤)
  if (effectText.includes('기물 1개 즉시 획득')) {
    const randomPiece = PIECES[Math.floor(Math.random() * PIECES.length)]
    run.addPiece(randomPiece)
  }

  // 최대 HP 감소 (영구)
  const maxHpMatch = effectText.match(/최대 HP ([+-]\d+) \(영구\)/)
  if (maxHpMatch) {
    const amount = parseInt(maxHpMatch[1])
    // 음수면 최대 HP 감소
    if (amount < 0) run.increaseMaxHP(amount)
  }
}
```

---

## 4. 모바일 반응형

`Battle.tsx` 에 모바일 레이아웃 추가:

```tsx
// 세로 모드: 상단 보드, 하단 패널
<div className="flex flex-col lg:flex-row flex-1 gap-4 p-4">
  {/* 보드 - 모바일에서 상단 */}
  <div className="flex items-center justify-center lg:flex-1">
    <GameBoard />
  </div>

  {/* 사이드 패널 - 모바일에서 하단 스크롤 */}
  <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
    {/* 기물 카드들 */}
  </div>
</div>
```

---

## 5. E2E 테스트

```typescript
// tests/e2e/battle.spec.ts
import { test, expect } from '@playwright/test'

test('기본 게임 플로우', async ({ page }) => {
  await page.goto('/')

  // 메인 메뉴
  await expect(page.getByText('VANGUARD PUSH')).toBeVisible()
  await page.getByText('새 게임').click()

  // 기물 픽
  await expect(page.getByText('초기 기물 선택')).toBeVisible()
  const pieceCards = page.locator('[data-testid="piece-card"]')
  await pieceCards.nth(0).click()
  await pieceCards.nth(1).click()
  await pieceCards.nth(2).click()
  await page.getByText('출정 →').click()

  // 런 맵
  await expect(page.getByText('구역 1')).toBeVisible()
})

test('충돌 계산 정확성', async ({ page }) => {
  // 전투 화면 직접 이동 후 충돌 미리보기 검증
  // 힘 4, 질량 2 기물 → 3칸 밀림 표시 확인
})
```

---

## 6. Cloudflare Pages 배포

### 설정

```
빌드 명령:    npm run build
출력 폴더:    dist
Node 버전:    20
```

### package.json scripts 최종

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit"
  }
}
```

### _redirects (SPA 라우팅)

`public/_redirects` 파일:
```
/* /index.html 200
```

---

## 7. 최종 검증 체크리스트

```
게임 플로우:
[ ] 메인 메뉴 → 기물 픽 3개 → 런 맵 진입
[ ] 맵 노드 선택 → 진형 선택 → 전투 진입
[ ] 전투: 기물 선택 → 이동 → 턴 종료 → AI 행동
[ ] 충돌 미리보기 수치가 공식과 일치 (힘4, 질량2 → 3칸)
[ ] 연쇄 충돌 발생 확인
[ ] 적 행동 의도 화살표 표시
[ ] 기물 사망 시 지휘관 HP 감소
[ ] 층 클리어 → 보상 선택 → 맵 복귀
[ ] 보스전 페이즈 전환
[ ] 지휘관 HP 0 → 패배 화면
[ ] 보스 클리어 → 승리 화면
[ ] localStorage 저장/불러오기

성능:
[ ] AI 응답이 메인 스레드를 블로킹하지 않음 (Web Worker 분리 확인)
[ ] 애니메이션이 60fps 유지

모바일:
[ ] 세로 모드 레이아웃 정상
[ ] 터치로 기물 선택/이동 가능
```

---

## 완료 후

`.agent/progress.md` 최종 기록:
```
## Phase 7 완료 — 프로젝트 완성

모든 단계 완료:
Phase 1: 기반 설정 ✓
Phase 2: 게임 엔진 ✓
Phase 3: AI 엔진 ✓
Phase 4: 상태 관리 ✓
Phase 5: UI 컴포넌트 ✓
Phase 6: 화면 구현 ✓
Phase 7: 통합 & 배포 ✓

배포 URL: (Cloudflare Pages URL 기록)
```
