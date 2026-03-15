# Phase 3 — AI 엔진

> **이 단계에서 완료할 것:** 룰 기반 AI Web Worker, AI 훅
> **선행 조건:** Phase 2 완료

---

## 체크리스트

- [ ] `src/workers/aiWorker.ts` — 룰 기반 AI (Web Worker)
- [ ] `src/hooks/useAI.ts` — Web Worker 통신 훅
- [ ] AI 동작 수동 검증
- [ ] `.agent/progress.md` 업데이트

---

## src/workers/aiWorker.ts

```typescript
import type {
  AIWorkerMessage, AIWorkerResponse, AIAction,
  PieceToken, GameState, IntentArrow
} from '@/types/game'
import { calculatePushDistance, calculateChainForce } from '@/engine/collision'
import { getValidMoves } from '@/engine/moveEngine'
import { PIECES } from '@/data/pieces'

self.onmessage = (e: MessageEvent<AIWorkerMessage>) => {
  const { type, gameState, aiPieces, archetype, difficulty } = e.data

  if (type === 'compute_turn') {
    const actions = computeRuleBasedTurn(gameState, aiPieces, archetype, difficulty)
    const intentArrows = generateIntentArrows(actions, aiPieces)
    const response: AIWorkerResponse = { type: 'turn_computed', actions, intentArrows }
    self.postMessage(response)
  }
}

// ── 행동 결정 ──────────────────────────────────────────

function computeRuleBasedTurn(
  gameState: GameState,
  aiPieces: PieceToken[],
  archetype: string,
  difficulty: number
): AIAction[] {
  const playerPieces = gameState.playerPieces.filter(p => !p.isDead)
  const actions: AIAction[] = []

  for (const aiPiece of aiPieces.filter(p => !p.isDead && !p.isSealed)) {
    const pieceDef = PIECES.find(p => p.id === aiPiece.definitionId)
    if (!pieceDef) continue

    const validMoves = getValidMoves(aiPiece, gameState.board, pieceDef.move)
    if (validMoves.length === 0) continue

    // 랜덤(?) 이동은 유효 칸에서 랜덤 선택
    if (pieceDef.move === '랜덤(?)') {
      const picked = validMoves[Math.floor(Math.random() * validMoves.length)]
      actions.push({ pieceId: aiPiece.instanceId, targetPosition: picked, priority: 1 })
      continue
    }

    const best = findBestMove(aiPiece, validMoves, playerPieces, gameState, archetype, difficulty)
    if (best) actions.push(best)
  }

  return actions
}

function findBestMove(
  aiPiece: PieceToken,
  validMoves: Array<{ row: number; col: number }>,
  playerPieces: PieceToken[],
  gameState: GameState,
  archetype: string,
  difficulty: number
): AIAction | null {
  let bestScore = -Infinity
  let bestMove: { row: number; col: number } | null = null

  for (const move of validMoves) {
    const score = evaluateMove(aiPiece, move, playerPieces, gameState, archetype, difficulty)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  if (!bestMove) return null
  return { pieceId: aiPiece.instanceId, targetPosition: bestMove, priority: bestScore }
}

function evaluateMove(
  aiPiece: PieceToken,
  targetPos: { row: number; col: number },
  playerPieces: PieceToken[],
  gameState: GameState,
  archetype: string,
  difficulty: number
): number {
  let score = 0
  const size = gameState.board.size
  const hasPenetrating = aiPiece.activeTraits.includes('관통')

  for (const player of playerPieces) {
    const dr = Math.sign(player.position.row - targetPos.row)
    const dc = Math.sign(player.position.col - targetPos.col)

    // 인접 여부 (충돌 가능)
    const isAdjacent =
      Math.abs(player.position.row - targetPos.row) +
      Math.abs(player.position.col - targetPos.col) === 1

    if (!isAdjacent) {
      // 접근 점수
      const dist = Math.abs(targetPos.row - player.position.row) +
                   Math.abs(targetPos.col - player.position.col)
      score += Math.max(0, 15 - dist * 2)
      continue
    }

    const pushDist = calculatePushDistance(aiPiece.currentForce, player.currentMass)
    const finalRow = player.position.row + dr * pushDist
    const finalCol = player.position.col + dc * pushDist

    // 우선순위 1: 그리드 밖으로 밀기 (+1000)
    if (finalRow < 0 || finalRow >= size || finalCol < 0 || finalCol >= size) {
      score += 1000
      continue
    }

    // 우선순위 2: 위험 타일로 밀기 (+500)
    const finalTile = gameState.board.tiles[finalRow]?.[finalCol]
    if (finalTile && finalTile !== 'normal') {
      score += 500
      continue
    }

    // 우선순위 3: 연쇄 유발 가능 (+100)
    const chainForce = calculateChainForce(aiPiece.currentForce, player.currentMass)
    if (chainForce > 0) {
      const chainTarget = gameState.playerPieces.find(
        p => p.position.row === finalRow && p.position.col === finalCol && !p.isDead
      )
      if (chainTarget) score += 100
    }

    // 우선순위 4: 가장자리로 유도 (+30)
    if (finalRow === 0 || finalRow === size-1 || finalCol === 0 || finalCol === size-1) {
      score += 30
    }

    // 기본 밀기 점수
    score += pushDist * 5
  }

  // 난이도별 노이즈 (낮은 난이도일수록 랜덤성 추가)
  if (difficulty <= 1) score += Math.random() * 50

  return score
}

// ── 의도 화살표 생성 ────────────────────────────────────

function generateIntentArrows(actions: AIAction[], pieces: PieceToken[]): IntentArrow[] {
  return actions.map(action => {
    const piece = pieces.find(p => p.instanceId === action.pieceId)
    if (!piece) return null

    const dr = action.targetPosition.row - piece.position.row
    const dc = action.targetPosition.col - piece.position.col

    let direction: IntentArrow['direction'] = 'none'
    if (Math.abs(dr) > Math.abs(dc)) direction = dr > 0 ? 'down' : 'up'
    else if (Math.abs(dc) > Math.abs(dr)) direction = dc > 0 ? 'right' : 'left'

    return { pieceId: action.pieceId, from: piece.position, to: action.targetPosition, direction }
  }).filter((a): a is IntentArrow => a !== null)
}
```

---

## src/hooks/useAI.ts

```typescript
import { useRef, useCallback, useEffect } from 'react'
import type { AIWorkerMessage, AIWorkerResponse } from '@/types/game'

export function useAI() {
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/aiWorker.ts', import.meta.url),
      { type: 'module' }
    )
    return () => workerRef.current?.terminate()
  }, [])

  const computeAITurn = useCallback(
    (message: AIWorkerMessage): Promise<AIWorkerResponse> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) { reject('Worker not ready'); return }

        const handler = (e: MessageEvent<AIWorkerResponse>) => {
          workerRef.current?.removeEventListener('message', handler)
          resolve(e.data)
        }

        workerRef.current.addEventListener('message', handler)
        workerRef.current.postMessage(message)
      })
    },
    []
  )

  return { computeAITurn }
}
```

---

## Phase 2 AI 구현 계획 (출시 후 업데이트)

```
Phase 2 목표: MCTS + 경량 신경망 (TensorFlow.js)

구조:
- PolicyNetwork: 보드 상태 → 행동 확률 분포
  입력: (boardSize × boardSize × channels) 텐서
  채널: [아군위치, 아군힘, 아군질량, 아군민첩, 적위치, 적힘, 적질량, 위험타일, ...]
  출력: 모든 가능한 행동에 대한 softmax 확률

- ValueNetwork: 보드 상태 → 승률 (0~1)

- MCTS 루프:
  1. 현재 상태에서 PolicyNet으로 유망한 행동 k개 선택
  2. 각 행동에 대해 N번 시뮬레이션 (룰 기반 AI로 rollout)
  3. 가장 높은 승률의 행동 선택

- 학습: 셀프플레이 → 게임 기록 저장 → Python으로 오프라인 학습
  → TensorFlow.js 모델로 변환 → public/models/ 에 배포

- 전환: Phase 1 룰 기반과 인터페이스 동일. Worker 내에서만 교체.
```

---

## 완료 후

`.agent/progress.md` 에 추가:
```
## Phase 3 완료
- src/workers/aiWorker.ts ✓
- src/hooks/useAI.ts ✓
다음 단계: phase_04_state.md
```
