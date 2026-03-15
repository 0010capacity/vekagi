# VANGUARD PUSH

> **AI 에이전트 전용 프로젝트 문서 패키지**
> 이 폴더 하나로 전체 게임을 구현할 수 있다.

## 폴더 구조

```
vanguard-push-docs/
│
├── README.md                  ← 지금 이 파일. 시작점.
│
├── .agent/                    ← 에이전트 작업 지시 (여기서 시작)
│   ├── 00_START_HERE.md       ← 반드시 먼저 읽을 것
│   ├── phase_01_foundation.md ← 1단계: 기반 설정
│   ├── phase_02_engine.md     ← 2단계: 게임 엔진
│   ├── phase_03_ai.md         ← 3단계: AI 엔진
│   ├── phase_04_state.md      ← 4단계: 상태 관리
│   ├── phase_05_ui.md         ← 5단계: UI 컴포넌트
│   ├── phase_06_screens.md    ← 6단계: 화면 구현
│   └── phase_07_polish.md     ← 7단계: 통합 & 마무리
│
├── docs/                      ← 게임 설계 문서
│   ├── concept.md             ← 게임 컨셉 & 규칙
│   ├── tech_stack.md          ← 기술 스택 & 아키텍처
│   └── ux_flow.md             ← UI/UX & 화면 흐름
│
└── src/                       ← 초기 코드 스캐폴딩
    ├── types/
    │   └── game.ts            ← 전체 타입 정의 (완성본)
    ├── data/
    │   ├── pieces.ts          ← 기물 50종 데이터 (완성본)
    │   ├── formations.ts      ← 진형 24종 데이터 (완성본)
    │   ├── bosses.ts          ← 보스 4종 데이터 (완성본)
    │   ├── events.ts          ← 이벤트 15종 데이터 (완성본)
    │   └── shop.ts            ← 상점 데이터 (완성본)
    ├── engine/
    │   └── collision.ts       ← 충돌 엔진 (완성본)
    ├── stores/
    │   ├── gameStore.ts       ← 전투 상태 스토어 (스캐폴딩)
    │   └── runStore.ts        ← 런 상태 스토어 (스캐폴딩)
    ├── workers/
    │   └── aiWorker.ts        ← AI Web Worker (스캐폴딩)
    ├── components/            ← 컴포넌트 구조 (에이전트가 구현)
    └── screens/               ← 화면 구조 (에이전트가 구현)
```

## 에이전트 시작 방법

1. `.agent/00_START_HERE.md` 를 읽는다
2. 현재 진행 단계의 phase 파일을 읽는다
3. `src/` 의 완성본 파일들을 프로젝트에 복사한다
4. 단계별 지시에 따라 구현한다
