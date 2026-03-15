# VANGUARD PUSH — 기술 스택 & UI/UX 설계

## 기술 스택

### 프론트엔드

| 기술 | 용도 | 선택 이유 |
|---|---|---|
| React + TypeScript | UI 전체 | 컴포넌트 재사용, 복잡한 상태 타입 안정성 필수 |
| Zustand | 전역 상태 관리 | 보일러플레이트 최소, 게임 상태 단일 스토어 관리 |
| Vite | 빌드 도구 | 빠른 HMR, 번들 최적화 내장 |
| Framer Motion | 애니메이션 | 기물 이동, 충돌 연출, 카드 플립 선언적 구현 |
| Tailwind CSS | 스타일 | 일관된 디자인 시스템, 다크모드 내장 지원 |

### 게임 로직 & AI

| 기술 | 용도 | 선택 이유 |
|---|---|---|
| 순수 TypeScript | 게임 엔진 | UI와 완전 분리, 테스트 용이 |
| Web Worker | AI 연산 분리 | MCTS 시뮬레이션 중 UI 블로킹 방지 |
| Phase 1: 룰 기반 AI | 출시 초기 | 즉시 구현 가능, 예측 가능한 위협 |
| Phase 2: TensorFlow.js + MCTS | 업데이트 | 브라우저 내 추론, 셀프플레이 학습 |

### 데이터 & 배포

| 기술 | 용도 | 선택 이유 |
|---|---|---|
| 정적 JSON 파일 | 게임 데이터 | 빌드 타임 번들, 서버 불필요 |
| localStorage | 런 저장 | 서버 없이 자동 저장, 이어하기 구현 |
| Cloudflare Pages | 호스팅 | 무료 정적 호스팅, 전세계 CDN, GitHub 자동 배포 |
| Vitest + Playwright | 테스트 | 충돌 공식 유닛 테스트, E2E 플로우 검증 |

---

## 프로젝트 구조

```
src/
├── components/
│   ├── board/          # GameBoard, Cell, PieceToken
│   ├── pieces/         # PieceCard, PieceStats, TraitBadge
│   ├── formations/     # FormationCard, FormationGrid
│   ├── hud/            # APBar, HPBar, TurnOrder, CountdownTimer
│   ├── map/            # RunMap, NodeIcon, PathLine
│   └── modals/         # ShopModal, EventModal, RewardModal, BossPanel
├── engine/
│   ├── collision.ts        # 충돌 공식 (순수 함수)
│   ├── turnEngine.ts       # 턴 실행, 우선권 계산
│   ├── countdownEngine.ts  # 카운트다운 처리
│   └── formationEngine.ts  # 진형 효과 계산
├── stores/
│   ├── gameStore.ts    # 현재 전투 상태 (보드, 기물, 턴)
│   ├── runStore.ts     # 런 진행 전체 (HP, 층, 보유 기물)
│   └── uiStore.ts      # UI 상태 (모달, 선택, 애니메이션)
├── workers/
│   └── aiWorker.ts     # Web Worker AI (룰 기반 → MCTS)
├── data/
│   ├── pieces.json
│   ├── formations.json
│   ├── bosses.json
│   ├── events.json
│   └── shop.json
└── types/
    └── game.ts         # 전체 타입 정의
```

---

## 레이어 아키텍처

```
UI Layer (React Components)
        ↕  Zustand Store (단방향 데이터 흐름)
Game State Layer (gameStore / runStore / uiStore)
        ↕  순수 함수 호출
Game Engine Layer (collision.ts / turnEngine.ts / ...)
        ↕
Data Layer (정적 JSON + localStorage)
        ↕  Web Worker 메시지 패싱
AI Worker (별도 스레드)
```

---

## 화면 흐름 (Screen Flow)

```
1. 메인 메뉴
   └─ 새 런 시작 / 이어하기 / 업적 / 설정
   └─ 배경: 그리드 애니메이션

2. 런 시작 — 초기 기물 픽
   └─ 6종 기물 중 3개 선택
   └─ 각 카드: 스탯, 이동 방식, 특성 표시
   └─ 조합 시너지 힌트

3. 런 맵
   └─ Slay the Spire식 분기 맵
   └─ 노드: 전투/정예/거점/상인/이벤트/보스
   └─ HUD: 지휘관 HP, 보유 기물 미니 표시

4. 층 시작 — 진형 선택 & 배치
   └─ 보유 진형 카드 중 1개 선택
   └─ 그리드 미리보기에 기물 드래그 배치
   └─ 적 초기 배치 미리 표시

5. 전투 화면 (메인)
   └─ 좌: 그리드 보드
   └─ 우 상단: 아군 기물 패널 (스탯, AP 비용)
   └─ 우 하단: AP바, 턴 종료 버튼, 카운트다운 타이머
   └─ 상단: 적 행동 의도 화살표 표시

6. 전투 해결 애니메이션
   └─ 우선권 순서대로 기물 이동 (0.5초/기물)
   └─ 충돌 연출: 흔들림 + 임팩트 이펙트
   └─ 연쇄 충돌: 0.3초 간격 순차 연출
   └─ 전달 힘 수치 표시

7. 층 클리어 보상
   └─ 3가지 선택지 카드
   └─ 기물 픽 / 회복 / 진형 카드 / 강화 랜덤 구성

8. 상인 / 이벤트 / 거점
   └─ 상인: 상품 목록 + 화폐 표시
   └─ 이벤트: 텍스트 + 선택지 2~3개
   └─ 거점: 무료 선택 3개

9. 보스전
   └─ 전투 화면 + 보스 페이즈 UI 추가
   └─ 현재 페이즈, 전환 조건 표시
   └─ 보스 특수 타일 강조

10. 런 종료 화면
    └─ 클리어 / 패배 결과
    └─ 통계: 총 턴, 사망 횟수, 최대 연쇄
    └─ 업적 해금, 다음 런 시작
```

---

## 전투 화면 레이아웃

```
┌─────────────────────────────────────────────┐
│  구역 1 · 층 3/10          지휘관 HP 8/12   │  ← 상단 HUD
├───────────────────────────┬─────────────────┤
│                           │  아군 기물 패널 │
│    메인 그리드 (6×6)      │  ─────────────  │
│                           │  보병  AP·1    │
│  [■][■][■][■][■][■]      │  돌격대 AP·2 ← │
│  [■][■][■][■][■][■]      │  군악대 AP·1   │
│  [■][■][■][■][■][■]      │  ─────────────  │
│  [■][■][■][■][■][■]      │  우선권 예상   │
│  [■][■][■][■][■][■]      │  돌격대 > 적A  │
│  [■][■][■][■][■][■]      │  > 보병 > ...  │
│                           │                 │
├───────────────────────────┴─────────────────┤
│  AP [●][●][●][○][○][○] 3/6    [진형] [턴종료→] │
└─────────────────────────────────────────────┘
```

---

## 색상 팔레트

| 용도 | 색상 | 코드 |
|---|---|---|
| 아군 기물 | Blue | #185FA5 |
| 적 기물 | Red | #A32D2D |
| 위험 타일 | Red (밝음) | #E24B4A |
| 적 행동 예고 화살표 | Amber | #EF9F27 |
| 버프/강화 상태 | Teal | #1D9E75 |
| 카운트다운 경고 | Amber (어둠) | #854F0B |
| 보드 배경 | Gray | #F1EFE8 |
| 핵심 슬롯 | Orange | #854F0B |

---

## UX 핵심 원칙

### 충돌 미리보기
- 기물 선택 후 이동 가능 칸 하이라이트
- 해당 칸으로 이동 시 몇 칸 밀리는지 숫자 즉시 표시
- 연쇄 경로 점선으로 표시

### 적 의도 투명성
- 적 기물 위에 이동 방향 화살표 항상 표시
- 클릭 시 "이 기물이 이동하면 아군 X가 Y칸 밀린다" 시뮬레이션 팝업

### 연쇄 연출
- 연쇄 충돌 발생 시 0.3초 간격으로 순차 연출
- 충돌 지점 임팩트 이펙트
- 전달 힘 수치 표시

### 정보 접근성
- 모든 기물 호버 시 스탯 툴팁
- 특성 이름 클릭 시 설명 팝업
- 진형 효과 항상 사이드 패널에 표시

### 모바일 대응
- 세로 모드: 상단 그리드, 하단 기물 패널
- 탭으로 기물 선택 후 탭으로 이동 확정
- 두 손가락 핀치로 그리드 확대

### 자동 저장
- 매 턴 종료 후 localStorage 자동 저장
- 창 닫힘 감지 시 즉시 저장
- 다음 접속 시 이어하기 버튼 자동 표시

---

## 핵심 TypeScript 타입 정의

```typescript
type MoveType =
  | '주(主)' | '사(斜)' | '전(全)'
  | '십자(十)' | '사선(╲)' | '도약(♞)'
  | '전진(↑)' | '역주(↓)' | '돌진(⇒)'
  | '고정(■)' | '랜덤(?)';

type TraitId =
  | '양날의검' | '무른' | '순교자' | '폭사'
  | '관통' | '반탄' | '고정대' | '가시'
  | '고취' | '방벽' | '가속' | '교란' | '약화'
  | '도발' | '은신';

interface Piece {
  id: number;
  name: string;
  category: '전사형' | '지원형' | '카운트다운형' | '특수이동형' | '복합형';
  move: MoveType;
  force: number;    // 힘 (1~6)
  mass: number;     // 질량 (1~6)
  agility: number;  // 민첩 (1~6)
  ap: number;       // AP 비용 (1~3)
  traits: string[];
  countdown?: { type: 'awaken' | 'collapse' | 'summon' | 'seal'; turns: number };
}

interface BoardState {
  size: 6 | 7 | 8;
  cells: (PieceToken | null)[][];
  dangerTiles: Set<string>;
}

interface GameState {
  board: BoardState;
  playerPieces: PieceToken[];
  enemyPieces: PieceToken[];
  currentAP: number;
  maxAP: number;
  turnNumber: number;
  phase: 'plan' | 'resolve' | 'execute' | 'countdown';
}

interface RunState {
  commanderHP: number;
  maxCommanderHP: number;
  ownedPieces: Piece[];
  activeFormation: Formation | null;
  currentZone: 1 | 2 | 3;
  currentFloor: number;
  currencies: { 전투결정: number; 정예결정: number; 공허파편: number };
}

// 충돌 공식 (순수 함수)
function calculatePush(attackerForce: number, targetMass: number): number {
  return 1 + Math.max(0, attackerForce - targetMass);
}

// 연쇄 충돌
function calculateChainForce(attackerForce: number, targetMass: number): number {
  return attackerForce - targetMass; // 0 이하면 연쇄 종료
}
```
