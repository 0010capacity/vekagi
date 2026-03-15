# VANGUARD PUSH — 에이전트 시작 가이드

> **반드시 이 파일을 먼저 읽어라.**
> 이 문서는 AI 코딩 에이전트가 VANGUARD PUSH 웹 게임을 구현하기 위한 전체 지시서다.

---

## 게임 한 줄 요약

그리드 위에서 기물을 밀어 적을 떨어뜨리는 물리 기반 전략 로그라이크 웹 게임.
참조: Into the Breach + Slay the Spire + 체스

---

## 확정 기술 스택

| 기술 | 버전 | 용도 |
|---|---|---|
| Vite | **8.0.x** | 빌드 도구 |
| React | 19.x | UI |
| TypeScript | 5.x | 언어 |
| Zustand | 5.x | 상태 관리 |
| Framer Motion | 11.x | 애니메이션 |
| Tailwind CSS | **4.x** | 스타일 |
| Vitest | 3.x | 테스트 |

**Tailwind v4 주의:** `tailwind.config.js` 생성하지 않음.
`@tailwindcss/vite` 플러그인 + CSS `@import "tailwindcss"` 방식 사용.

---

## 핵심 게임 규칙 (구현 시 절대 변경 불가)

### 충돌 공식
```
밀려나는 칸 수 = 1 + max(0, 공격자 힘 − 피격자 질량)
```
- 질량이 아무리 높아도 최소 1칸은 밀림
- 고정대 특성만 이 규칙 예외

### 연쇄 충돌
```
전달 힘 = 공격자 힘 − 피격자 질량
전달 힘 > 0 → 연쇄 계속 / ≤ 0 → 연쇄 종료
```

### 지휘관 HP
```
기물 사망 → 지휘관 HP -1 (기본)
양날의검 기물 사망 → 지휘관 HP -2
무른 기물 사망 → HP 변화 없음
순교자 기물 사망 → 지휘관 HP +1
지휘관 HP 0 → 런 종료 (패배)
```

### 턴 구조
```
1. 계획 페이즈: 플레이어 AP 소모, 이동 예약. 적 행동 의도 화살표 공개.
2. 해결 페이즈: d6 + 민첩 → 우선권 결정
3. 실행 페이즈: 우선권 순 이동 → 충돌 → 연쇄
4. 카운트다운 페이즈: 타이머 -1, 효과 발동
```

---

## 절대 규칙 10개

1. 충돌 공식 수정 금지 (`1 + max(0, 힘 - 질량)` 고정)
2. 게임 엔진(`src/engine/`)은 순수 함수만. React/Zustand import 금지
3. AI는 Web Worker로 분리. 메인 스레드 블로킹 금지
4. 적 행동 의도는 항상 해결 페이즈 전에 UI에 공개
5. 기물은 영구 소실 없음. 사망해도 다음 층 부활
6. 지휘관은 그리드에 존재하지 않음. 순수 HP 수치
7. AP는 매 턴 6으로 리셋. 이월 없음
8. Tailwind v4 문법 사용 (`@theme` 블록, `tailwind.config.js` 없음)
9. Vite 8.0 기준. `@tailwindcss/vite` 플러그인 사용
10. 모든 게임 데이터는 `src/data/`에서만 불러옴. 하드코딩 금지

---

## 단계별 진행 계획

각 단계는 독립적인 에이전트 세션에서 진행한다.
각 단계 시작 전 해당 phase 파일을 읽는다.

| 단계 | 파일 | 예상 세션 | 내용 |
|---|---|---|---|
| 1 | `phase_01_foundation.md` | 1세션 | 프로젝트 초기화, 설정 파일, 타입, 데이터 |
| 2 | `phase_02_engine.md` | 1세션 | 게임 엔진 (충돌, 턴, 카운트다운, 진형) |
| 3 | `phase_03_ai.md` | 1세션 | AI Web Worker (룰 기반) |
| 4 | `phase_04_state.md` | 1세션 | Zustand 스토어 전체 |
| 5 | `phase_05_ui.md` | 1~2세션 | 핵심 UI 컴포넌트 |
| 6 | `phase_06_screens.md` | 2세션 | 전체 화면 구현 |
| 7 | `phase_07_polish.md` | 1세션 | 통합, 테스트, 배포 |

---

## 단계 간 인수인계 방법

각 단계 완료 후 다음 세션 에이전트를 위해:
1. 완료된 파일 목록을 `.agent/progress.md`에 기록
2. 미완성 항목이나 알려진 버그를 `.agent/notes.md`에 기록
3. 다음 단계 에이전트는 이 두 파일을 먼저 읽는다

---

## 완성본 파일 목록 (즉시 사용 가능)

아래 파일들은 이미 완성되어 있다. 프로젝트 생성 후 `src/` 에 그대로 복사:

- `src/types/game.ts` — 전체 타입 정의
- `src/engine/collision.ts` — 충돌 엔진
- `src/data/pieces.ts` — 기물 50종 (`PieceDefinition[]`, 유틸 함수 포함)
- `src/data/formations.ts` — 진형 24종 (`Formation[]`, 유틸 함수 포함)
- `src/data/bosses.ts` — 보스 4종 (`BossDefinition[]`)
- `src/data/events.ts` — 이벤트 15종 (`GameEvent[]`, 유틸 함수 포함)
- `src/data/shop.ts` — 상점 데이터 (`ShopData`)
- `src/data/index.ts` — 통합 barrel export

> 데이터는 JSON이 아닌 TypeScript 파일로 제공된다.
> 빌드 타임 타입 체크, 오타/누락 즉시 감지, 유틸 함수 포함의 이점이 있다.
> import 방법: `import { PIECES, getPieceById } from '@/data/pieces'`
> 또는 통합: `import { PIECES, FORMATIONS, BOSSES } from '@/data'`

---

## 참고 문서

- `docs/concept.md` — 게임 전체 규칙 상세
- `docs/tech_stack.md` — 기술 스택 및 아키텍처
- `docs/ux_flow.md` — 화면 흐름 및 UI 설계
