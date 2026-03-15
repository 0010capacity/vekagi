// src/workers/aiWorker.ts
// 룰 기반 AI Web Worker

import type {
  AIWorkerMessage, AIWorkerResponse, AIAction,
  PieceToken, GameState, IntentArrow, AIArchetype
} from '@/types/game'
import { calculatePushDistance, calculateChainForce } from '@/engine/collision'
import { getValidMoves } from '@/engine/moveEngine'

// Worker entry point
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
  archetype: AIArchetype,
  difficulty: number
): AIAction[] {
  const playerPieces = gameState.playerPieces.filter(p => !p.isDead)
  const actions: AIAction[] = []

  // 간단한 pieceDef 캐시 (PIECES import 없이)
  const moveCache = new Map<number, string>()

  for (const aiPiece of aiPieces.filter(p => !p.isDead && !p.isSealed)) {
    // moveType은 외부에서 전달받아야 하지만, 간단히 기본 이동 사용
    const moveType = moveCache.get(aiPiece.definitionId) || '전(全)'
    const validMoves = getValidMoves(aiPiece, gameState.board, moveType as any)
    if (validMoves.length === 0) continue

    // 랜덤(?) 이동은 유효 칸에서 랜덤 선택
    if (moveType === '랜덤(?)') {
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
  archetype: AIArchetype,
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
  archetype: AIArchetype,
  difficulty: number
): number {
  let score = 0
  const size = gameState.board.size

  // 아키타입별 가중치
  const weights = getArchetypeWeights(archetype)

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
      score += Math.max(0, 15 - dist * 2) * weights.approach
      continue
    }

    const pushDist = calculatePushDistance(aiPiece.currentForce, player.currentMass)
    const finalRow = player.position.row + dr * pushDist
    const finalCol = player.position.col + dc * pushDist

    // 우선순위 1: 그리드 밖으로 밀기 (+1000)
    if (finalRow < 0 || finalRow >= size || finalCol < 0 || finalCol >= size) {
      score += 1000 * weights.kill
      continue
    }

    // 우선순위 2: 위험 타일로 밀기 (+500)
    const finalTile = gameState.board.tiles[finalRow]?.[finalCol]
    if (finalTile && finalTile !== 'normal') {
      score += 500 * weights.danger
      continue
    }

    // 우선순위 3: 연쇄 유발 가능 (+100)
    const chainForce = calculateChainForce(aiPiece.currentForce, player.currentMass)
    if (chainForce > 0) {
      const chainTarget = gameState.playerPieces.find(
        p => p.position.row === finalRow && p.position.col === finalCol && !p.isDead
      )
      if (chainTarget) score += 100 * weights.chain
    }

    // 우선순위 4: 가장자리로 유도 (+30)
    if (finalRow === 0 || finalRow === size-1 || finalCol === 0 || finalCol === size-1) {
      score += 30 * weights.edge
    }

    // 기본 밀기 점수
    score += pushDist * 5 * weights.push
  }

  // 난이도별 노이즈 (낮은 난이도일수록 랜덤성 추가)
  if (difficulty <= 1) score += Math.random() * 50

  return score
}

function getArchetypeWeights(archetype: AIArchetype) {
  switch (archetype) {
    case 'aggressive':
      return { kill: 1.5, danger: 1.3, chain: 1.2, edge: 1.0, push: 1.2, approach: 1.5 }
    case 'pressure':
      return { kill: 1.0, danger: 1.0, chain: 1.5, edge: 1.5, push: 1.0, approach: 1.2 }
    case 'protective':
      return { kill: 0.8, danger: 0.8, chain: 0.8, edge: 0.8, push: 0.8, approach: 0.5 }
    case 'kamikaze':
      return { kill: 2.0, danger: 2.0, chain: 1.5, edge: 1.5, push: 1.5, approach: 2.0 }
    case 'spawner':
      return { kill: 0.6, danger: 0.6, chain: 0.5, edge: 0.5, push: 0.5, approach: 0.3 }
    case 'chaos':
      return { kill: 1.0, danger: 1.0, chain: 1.0, edge: 1.0, push: 1.0, approach: 1.0 }
    default:
      return { kill: 1.0, danger: 1.0, chain: 1.0, edge: 1.0, push: 1.0, approach: 1.0 }
  }
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

// TypeScript worker export
export {}
