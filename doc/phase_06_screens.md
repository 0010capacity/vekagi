# Phase 6 — 화면 구현

> **이 단계에서 완료할 것:** 모든 화면(Screen) 구현 + App.tsx 연결
> **선행 조건:** Phase 5 완료

---

## 체크리스트

### 세션 A (단순 화면)
- [ ] `src/App.tsx` — 화면 전환 라우터
- [ ] `src/screens/MainMenu.tsx`
- [ ] `src/screens/RunEnd.tsx`
- [ ] `src/screens/Reward.tsx`
- [ ] `src/components/modals/EventModal.tsx`
- [ ] `src/components/modals/ShopModal.tsx`

### 세션 B (복잡 화면)
- [ ] `src/screens/PiecePick.tsx`
- [ ] `src/screens/FormationSetup.tsx`
- [ ] `src/screens/RunMapScreen.tsx`
- [ ] `src/screens/Battle.tsx` ← 가장 복잡
- [ ] `src/components/modals/RewardModal.tsx`
- [ ] `src/components/modals/BossPhasePanel.tsx`

---

## App.tsx

```tsx
import { useUIStore } from '@/stores/uiStore'
import { MainMenu } from '@/screens/MainMenu'
import { PiecePick } from '@/screens/PiecePick'
import { RunMapScreen } from '@/screens/RunMapScreen'
import { FormationSetup } from '@/screens/FormationSetup'
import { Battle } from '@/screens/Battle'
import { Reward } from '@/screens/Reward'
import { RunEnd } from '@/screens/RunEnd'

export default function App() {
  const { currentScreen } = useUIStore()

  const screens = {
    main_menu: <MainMenu />,
    piece_pick: <PiecePick />,
    run_map: <RunMapScreen />,
    formation_setup: <FormationSetup />,
    battle: <Battle />,
    reward: <Reward />,
    run_end: <RunEnd />,
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {screens[currentScreen as keyof typeof screens] ?? <MainMenu />}
    </div>
  )
}
```

---

## MainMenu.tsx

```tsx
import { useUIStore } from '@/stores/uiStore'
import { useSaveLoad } from '@/hooks/useSaveLoad'

export function MainMenu() {
  const { setScreen } = useUIStore()
  const { hasSavedRun } = useSaveLoad()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-widest text-white mb-2">VANGUARD PUSH</h1>
        <p className="text-slate-400">물리 기반 전략 로그라이크</p>
      </div>

      <div className="flex flex-col gap-3 w-48">
        <button
          className="bg-blue-700 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
          onClick={() => setScreen('piece_pick')}
        >
          새 게임
        </button>

        {hasSavedRun() && (
          <button
            className="bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-semibold transition-colors"
            onClick={() => setScreen('run_map')}
          >
            이어하기
          </button>
        )}

        <button className="text-slate-400 hover:text-white py-2 text-sm transition-colors">
          업적
        </button>
      </div>
    </div>
  )
}
```

---

## PiecePick.tsx

```tsx
import { useState } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { useRunStore } from '@/stores/runStore'
import { PieceCard } from '@/components/pieces/PieceCard'
import { PIECES } from '@/data/pieces'

// 시작 기물 풀: 랜덤 6개 중 3개 선택
export function PiecePick() {
  const { setScreen } = useUIStore()
  const { startRun } = useRunStore()
  const [selected, setSelected] = useState<number[]>([])

  // 시작 풀: 전사형과 지원형 위주로 랜덤 6종
  const pool = PIECES
    .filter(p => ['전사형', '지원형'].includes(p.category))
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)

  const toggle = (id: number) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const confirm = () => {
    const pieces = pool.filter(p => selected.includes(p.id))
    startRun(pieces)
    setScreen('run_map')
  }

  return (
    <div className="min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-2">초기 기물 선택</h2>
      <p className="text-slate-400 mb-6">3개를 선택하세요 ({selected.length}/3)</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {pool.map(piece => (
          <PieceCard
            key={piece.id}
            piece={piece}
            selected={selected.includes(piece.id)}
            onClick={() => toggle(piece.id)}
          />
        ))}
      </div>

      <button
        disabled={selected.length !== 3}
        onClick={confirm}
        className="bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
      >
        출정 →
      </button>
    </div>
  )
}
```

---

## Battle.tsx (핵심 화면)

```tsx
import { GameBoard } from '@/components/board/GameBoard'
import { APBar } from '@/components/hud/APBar'
import { HPBar } from '@/components/hud/HPBar'
import { PieceCard } from '@/components/pieces/PieceCard'
import { BossPhasePanel } from '@/components/modals/BossPhasePanel'
import { useGameStore } from '@/stores/gameStore'
import { useRunStore } from '@/stores/runStore'
import { useUIStore } from '@/stores/uiStore'
import { useGameEngine } from '@/hooks/useGameEngine'
import { PIECES } from '@/data/pieces'

export function Battle() {
  const game = useGameStore()
  const run = useRunStore()
  const ui = useUIStore()
  const { handleEndTurn } = useGameEngine()

  return (
    <div className="min-h-screen flex flex-col">
      {/* 상단 HUD */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <span className="text-sm text-slate-400">
          구역 {run.currentZone} · 층 {run.currentFloor}
        </span>
        <HPBar current={run.commanderHP} max={run.maxCommanderHP} />
        <span className="text-sm text-slate-400">턴 {game.turnNumber}</span>
      </div>

      {/* 메인 영역 */}
      <div className="flex flex-1 gap-4 p-4">
        {/* 보드 */}
        <div className="flex-1 flex items-center justify-center">
          <GameBoard />
        </div>

        {/* 사이드 패널 */}
        <div className="w-64 flex flex-col gap-3">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
            아군 기물
          </div>
          {game.playerPieces.filter(p => !p.isDead).map(piece => {
            const def = PIECES.find(p => p.id === piece.definitionId)
            if (!def) return null
            return (
              <PieceCard
                key={piece.instanceId}
                piece={def}
                compact
                selected={game.selectedPieceId === piece.instanceId}
                onClick={() => {}}
              />
            )
          })}

          {/* 우선권 미리보기 */}
          <div className="mt-auto">
            <div className="text-xs text-slate-500 mb-1">우선권 예상</div>
            <div className="text-xs text-slate-400">
              {/* 우선권 순서 표시 */}
              d6 + 민첩 굴림
            </div>
          </div>
        </div>
      </div>

      {/* 하단 HUD */}
      <div className="flex items-center gap-4 px-4 py-3 bg-slate-900 border-t border-slate-700">
        <APBar current={game.currentAP} max={game.maxAP} />

        <div className="flex gap-2 ml-auto">
          <button
            className="text-slate-300 hover:text-white border border-slate-600 px-4 py-2 rounded text-sm transition-colors"
            onClick={() => ui.openModal('formation')}
          >
            진형 보기
          </button>
          <button
            disabled={ui.isAnimating}
            onClick={handleEndTurn}
            className="bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 text-white px-6 py-2 rounded font-semibold transition-colors"
          >
            턴 종료 →
          </button>
        </div>
      </div>

      {/* 보스전 페이즈 패널 */}
      {game.isBossBattle && <BossPhasePanel phase={game.bossPhase} />}
    </div>
  )
}
```

---

## FormationSetup.tsx

```tsx
import { useState } from 'react'
import { useRunStore } from '@/stores/runStore'
import { useUIStore } from '@/stores/uiStore'
import { FormationCard } from '@/components/formations/FormationCard'
import { FORMATIONS } from '@/data/formations'

export function FormationSetup() {
  const run = useRunStore()
  const { setScreen } = useUIStore()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // 보유 진형 없으면 기본 진형 제공
  const available = run.ownedFormations.length > 0
    ? run.ownedFormations
    : FORMATIONS.filter(f => f.rarity === '기본').slice(0, 3)

  const confirm = () => {
    const formation = available.find(f => f.id === selectedId)
    if (!formation) return
    run.setActiveFormation(formation)
    setScreen('battle')
  }

  return (
    <div className="min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-2">진형 선택</h2>
      <p className="text-slate-400 mb-6">이번 층에 사용할 진형을 선택하세요</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {available.map(f => (
          <FormationCard
            key={f.id}
            formation={f}
            selected={selectedId === f.id}
            onClick={() => setSelectedId(f.id)}
          />
        ))}
      </div>

      <button
        disabled={!selectedId}
        onClick={confirm}
        className="bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-3 rounded-lg font-semibold"
      >
        배치 →
      </button>
    </div>
  )
}
```

---

## EventModal.tsx

```tsx
import { EVENTS } from '@/data/events'
import { useUIStore } from '@/stores/uiStore'
import { useRunStore } from '@/stores/runStore'

export function EventModal() {
  const { closeModal } = useUIStore()
  const run = useRunStore()

  // 랜덤 이벤트 선택
  const event = EVENTS[Math.floor(Math.random() * EVENTS.length)]

  const handleChoice = (choice: typeof event.choices[0]) => {
    // 이펙트 파싱은 개별 구현
    // 예시: "지휘관 HP -2" → run.damageCommander(2)
    closeModal()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-xs text-slate-400 mb-1">{event.type}</div>
        <h3 className="text-xl font-bold mb-3">{event.name}</h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">{event.desc}</p>

        <div className="flex flex-col gap-2">
          {event.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => handleChoice(choice)}
              className={`text-left p-3 rounded-lg border transition-colors ${
                choice.risk === 'none' || choice.risk === 'low'
                  ? 'border-emerald-700 hover:bg-emerald-900/30 text-emerald-300'
                  : choice.risk === 'high' || choice.risk === 'extreme'
                  ? 'border-red-700 hover:bg-red-900/30 text-red-300'
                  : 'border-amber-700 hover:bg-amber-900/30 text-amber-300'
              }`}
            >
              <div className="font-semibold text-sm">{choice.label}</div>
              <div className="text-xs opacity-70 mt-0.5">{choice.effect}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## ShopModal.tsx

```tsx
import { SHOP } from '@/data/shop'
import { useUIStore } from '@/stores/uiStore'
import { useRunStore } from '@/stores/runStore'

export function ShopModal() {
  const { closeModal } = useUIStore()
  const run = useRunStore()

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-auto py-8">
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">상인</h3>
          <div className="flex gap-3 text-sm">
            <span className="text-yellow-400">◆ {run.currencies.전투결정}</span>
            <span className="text-blue-400">◈ {run.currencies.정예결정}</span>
            <span className="text-purple-400">✦ {run.currencies.공허파편}</span>
          </div>
        </div>

        {SHOP.categories.map(cat => (
          <div key={cat.name} className="mb-6">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
              {cat.name}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {cat.items.map(item => (
                <div key={item.name} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{item.desc}</div>
                  <div className="text-xs text-yellow-400 mt-2">{item.cost}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={closeModal} className="w-full py-2 text-slate-400 hover:text-white text-sm">
          닫기
        </button>
      </div>
    </div>
  )
}
```

---

## RunEnd.tsx

```tsx
import { useRunStore } from '@/stores/runStore'
import { useUIStore } from '@/stores/uiStore'
import { useSaveLoad } from '@/hooks/useSaveLoad'

export function RunEnd() {
  const run = useRunStore()
  const { setScreen } = useUIStore()
  const { clearSavedRun } = useSaveLoad()

  const isVictory = run.runResult === 'victory'

  const handleRestart = () => {
    clearSavedRun()
    setScreen('main_menu')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8">
      <div className="text-center">
        <div className={`text-5xl font-bold mb-2 ${isVictory ? 'text-yellow-400' : 'text-red-400'}`}>
          {isVictory ? '승리' : '패배'}
        </div>
        <p className="text-slate-400">
          {isVictory ? '최종 보스를 격파했다.' : '지휘관이 쓰러졌다.'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: '클리어 층', value: run.stats.floorsCleared },
          { label: '총 턴', value: run.stats.totalTurns },
          { label: '기물 사망', value: run.stats.totalDeaths },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <button onClick={handleRestart} className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold">
        메인 메뉴
      </button>
    </div>
  )
}
```

---

## 완료 후

`.agent/progress.md` 에 추가:
```
## Phase 6 완료
- 모든 화면 구현 ✓
- App.tsx 연결 ✓
다음 단계: phase_07_polish.md
```
