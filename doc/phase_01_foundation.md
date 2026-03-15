# Phase 1 — 기반 설정

> **이 단계에서 완료할 것:** 프로젝트 초기화, 설정 파일, 타입 정의, 데이터 파일, 충돌 엔진, 테스트

---

## 체크리스트

- [ ] Vite 8 + React + TypeScript 프로젝트 생성
- [ ] 의존성 설치
- [ ] 설정 파일 작성 (`vite.config.ts`, `tsconfig.json`, `index.css`)
- [ ] `src/types/game.ts` 복사
- [ ] `src/data/` 전체 파일 복사
- [ ] `src/engine/collision.ts` 복사
- [ ] `tests/engine/collision.test.ts` 작성 및 통과 확인
- [ ] `npm run dev` 로 빈 화면 정상 실행 확인
- [ ] `.agent/progress.md` 업데이트

---

## 1. 프로젝트 생성

```bash
npm create vite@latest vanguard-push -- --template react-ts
cd vanguard-push
```

---

## 2. 의존성 설치

```bash
npm install react@^19 react-dom@^19 zustand@^5 framer-motion@^11 clsx@^2
npm install -D vite@^8 @vitejs/plugin-react@^4 typescript@^5
npm install -D @types/react@^19 @types/react-dom@^19
npm install -D tailwindcss@^4 @tailwindcss/vite@^4
npm install -D vitest@^3 @vitest/ui@^3 @testing-library/react@^16
npm install -D playwright@^1.40
```

---

## 3. vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

---

## 4. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 5. src/index.css

```css
@import "tailwindcss";

@theme {
  --color-player: #185FA5;
  --color-player-light: #3B82F6;
  --color-enemy: #A32D2D;
  --color-enemy-light: #EF4444;
  --color-danger: #E24B4A;
  --color-intent: #EF9F27;
  --color-buff: #1D9E75;
  --color-countdown: #854F0B;
  --color-board-bg: #0f172a;
  --color-cell: #1e293b;
  --color-cell-hover: #1d4ed8;
  --color-highlight: rgba(29, 78, 216, 0.4);
  --color-core-slot: #92400e;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: #0f172a;
  color: #f1f5f9;
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

---

## 6. index.html

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VANGUARD PUSH</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 7. src/main.tsx

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## 8. src/App.tsx (임시 — Phase 6에서 완성)

```typescript
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold text-white">VANGUARD PUSH</h1>
    </div>
  )
}
```

---

## 9. 완성본 파일 복사

아래 파일들은 이 패키지에 이미 완성되어 있다. 그대로 프로젝트 `src/` 에 복사한다.

```
src/types/game.ts          ← 전체 타입 정의
src/engine/collision.ts    ← 충돌 엔진 (공식 포함)
src/data/pieces.ts         ← 기물 50종 (PieceDefinition[] 타입)
src/data/formations.ts     ← 진형 24종 (Formation[] 타입)
src/data/bosses.ts         ← 보스 4종 (BossDefinition[] 타입)
src/data/events.ts         ← 이벤트 15종 (GameEvent[] 타입)
src/data/shop.ts           ← 상점 데이터 (ShopData 타입)
src/data/index.ts          ← 통합 barrel export
```

> **왜 JSON이 아닌 .ts인가?**
> - 타입 추론이 자동으로 `PieceDefinition[]` 등 정확한 타입으로 확정된다
> - 빌드 타임에 데이터 오타/누락 필드를 즉시 잡는다
> - `getPieceById()`, `getFormationsByRarity()` 등 유틸 함수가 같은 파일에 포함된다
> - 런타임 JSON 파싱 오버헤드 없음
>
> 이후 어디서든 데이터를 불러올 때는 JSON import 대신 아래처럼 사용한다:
> ```typescript
> import { PIECES, getPieceById } from '@/data/pieces';
> import { FORMATIONS } from '@/data/formations';
> // 또는 통합 import:
> import { PIECES, FORMATIONS, BOSSES } from '@/data';
> ```

---

## 10. 테스트 파일 작성

`tests/engine/collision.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calculatePushDistance, calculateChainForce } from '@/engine/collision'

describe('calculatePushDistance', () => {
  it('항상 최소 1칸 밀림', () => {
    expect(calculatePushDistance(1, 10)).toBe(1)
    expect(calculatePushDistance(1, 5)).toBe(1)
    expect(calculatePushDistance(2, 5)).toBe(1)
  })

  it('힘이 질량을 초과하면 추가 밀림', () => {
    expect(calculatePushDistance(4, 2)).toBe(3)  // 1 + (4-2)
    expect(calculatePushDistance(5, 1)).toBe(5)  // 1 + (5-1)
    expect(calculatePushDistance(3, 1)).toBe(3)  // 1 + (3-1)
  })

  it('힘 = 질량이면 1칸', () => {
    expect(calculatePushDistance(3, 3)).toBe(1)
    expect(calculatePushDistance(5, 5)).toBe(1)
  })
})

describe('calculateChainForce', () => {
  it('전달 힘 = 공격자 힘 - 피격자 질량', () => {
    expect(calculateChainForce(5, 2)).toBe(3)
    expect(calculateChainForce(3, 3)).toBe(0)
    expect(calculateChainForce(2, 4)).toBe(-2)
  })

  it('0 이하면 연쇄 종료 신호', () => {
    expect(calculateChainForce(3, 3) <= 0).toBe(true)
    expect(calculateChainForce(2, 4) <= 0).toBe(true)
  })

  it('양수면 연쇄 계속 신호', () => {
    expect(calculateChainForce(5, 2) > 0).toBe(true)
  })
})
```

테스트 실행: `npm run test` — 모두 통과해야 다음 단계 진행.

---

## 완료 후

`.agent/progress.md` 에 다음을 기록:
```
## Phase 1 완료

완료 파일:
- vite.config.ts ✓
- tsconfig.json ✓
- src/index.css ✓
- src/main.tsx ✓
- src/App.tsx (임시) ✓
- src/types/game.ts ✓
- src/data/pieces.ts ✓
- src/data/formations.ts ✓
- src/data/bosses.ts ✓
- src/data/events.ts ✓
- src/data/shop.ts ✓
- src/engine/collision.ts ✓
- tests/engine/collision.test.ts ✓ (전체 통과)

다음 단계: phase_02_engine.md
```
