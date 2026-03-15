// src/hooks/useGameEngine.ts
// 게임 엔진과 스토어를 연결하는 통합 훅

import { useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useRunStore } from '@/stores/runStore'
import { useUIStore } from '@/stores/uiStore'
import { useAI } from './useAI'
import { determineTurnOrder, resolvePieceMove } from '@/engine/turnEngine'
import { tickCountdowns, tickSealedStatus } from '@/engine/countdownEngine'
import { getValidMoves } from '@/engine/moveEngine'
import { PIECES } from '@/data/pieces'
import type { PieceToken, Position } from '@/types/game'

export function useGameEngine() {
  const game = useGameStore()
  const run = useRunStore()
  const ui = useUIStore()
  const { computeAITurn } = useAI()

  // 기물 선택 + 이동 미리보기 계산
  const handlePieceSelect = useCallback((pieceId: string | null) => {
    game.selectPiece(pieceId)
    if (!pieceId) {
      ui.setPreviewMoves([])
      return
    }

    const piece = game.playerPieces.find(p => p.instanceId === pieceId)
    if (!piece) return

    const def = PIECES.find(p => p.id === piece.definitionId)
    if (!def) return

    const moves = getValidMoves(piece, game.board, def.move)
    ui.setPreviewMoves(moves)
  }, [game, ui])

  // 이동 예약
  const handleMoveReservation = useCallback((pieceId: string, to: Position): boolean => {
    return game.reserveMove(pieceId, to)
  }, [game])

  // 이동 취소
  const handleCancelMove = useCallback((pieceId: string) => {
    game.cancelMove(pieceId)
    ui.setPreviewMoves([])
  }, [game, ui])

  // 턴 종료 → AI 계산 → 실행
  const handleEndTurn = useCallback(async () => {
    console.log('[handleEndTurn] 시작', { phase: game.phase, playerPieces: game.playerPieces.length, enemyPieces: game.enemyPieces.length })
    game.endTurn()
    ui.setIsAnimating(true)

    try {
      // AI 행동 계산 - Worker에 보낼 데이터는 순수 객체여야 함
      console.log('[handleEndTurn] AI 계산 중...')
      const gameStateForWorker = {
        board: {
          size: game.board.size,
          tiles: game.board.tiles,
          pieces: game.board.pieces,
        },
        playerPieces: game.playerPieces,
        enemyPieces: game.enemyPieces,
      }
      const aiResponse = await computeAITurn({
        type: 'compute_turn',
        gameState: gameStateForWorker,
        aiPieces: game.enemyPieces,
        archetype: 'aggressive',
        difficulty: game.isBossBattle ? 3 : 2,
      })

      // 우선권 결정
      const ordered = determineTurnOrder([...game.playerPieces, ...game.enemyPieces])

      // 플레이어 예약 이동 + AI 이동을 우선권 순서로 병합
      const allMoves: Array<{ pieceId: string; targetPos: Position; isPlayer: boolean }> = []

      // 플레이어 예약 이동 추가
      game.pendingMoves.forEach(pm => {
        allMoves.push({
          pieceId: pm.pieceId,
          targetPos: pm.to,
          isPlayer: true,
        })
      })

      // AI 이동 추가
      console.log('[handleEndTurn] AI 응답:', aiResponse.actions.length, '개의 행동')
      aiResponse.actions.forEach(action => {
        allMoves.push({
          pieceId: action.pieceId,
          targetPos: action.targetPosition,
          isPlayer: false,
        })
      })

      // 우선권 순서로 정렬
      const orderedMoves = ordered
        .map(o => allMoves.filter(m => m.pieceId === o.piece.instanceId))
        .flat()

      // 순차적 이동 처리 (애니메이션 포함)
      let currentPieces = [...game.playerPieces, ...game.enemyPieces]

      for (const move of orderedMoves) {
        const piece = currentPieces.find(p => p.instanceId === move.pieceId)
        if (!piece || piece.isDead) continue

        const def = PIECES.find(p => p.id === piece.definitionId)
        if (!def) continue

        // 충돌 처리
        const hasPenetrating = piece.activeTraits.includes('관통')
        const events = resolvePieceMove(piece, move.targetPos, currentPieces, game.board.size, hasPenetrating)

        // 이동 적용
        currentPieces = currentPieces.map(p => {
          if (p.instanceId === move.pieceId) {
            return { ...p, position: move.targetPos }
          }
          return p
        })

        // 충돌 이벤트 처리
        for (const event of events) {
          game.addLogEntry('collision', `${event.attackerId} -> ${event.targetId}: ${event.pushDistance}칸`)

          if (event.targetDied) {
            currentPieces = currentPieces.map(p =>
              p.instanceId === event.targetId ? { ...p, isDead: true } : p
            )
            game.addLogEntry('death', `${event.targetId} 격출됨`)

            // 플레이어 기물 사망 시 지휘관 HP 감소 (특성 기반)
            const targetPiece = currentPieces.find(p => p.instanceId === event.targetId)
            if (targetPiece?.owner === 'player') {
              const targetDef = PIECES.find(p => p.id === targetPiece.definitionId)
              let hpDamage = 1 // 기본 데미지

              if (targetDef) {
                if (targetDef.traits.includes('양날의검')) hpDamage = 2
                if (targetDef.traits.includes('무른')) hpDamage = 0
                if (targetDef.traits.includes('순교자')) hpDamage = -1 // 회복
              }

              if (hpDamage > 0) {
                run.damageCommander(hpDamage)
              } else if (hpDamage < 0) {
                run.healCommander(-hpDamage)
              }
              run.recordDeath(targetPiece.definitionId)
            }
          } else {
            // 밀려난 위치로 업데이트
            const pushTarget = currentPieces.find(p => p.instanceId === event.targetId)
            if (pushTarget) {
              const newRow = pushTarget.position.row + event.direction.dr * event.pushDistance
              const newCol = pushTarget.position.col + event.direction.dc * event.pushDistance
              currentPieces = currentPieces.map(p =>
                p.instanceId === event.targetId
                  ? { ...p, position: { row: newRow, col: newCol } }
                  : p
              )
            }
          }

          // 연쇄 충돌 기록
          if (event.chainForce > 0) {
            run.recordChainCollision(2) // 연쇄 2개 이상
          }
        }

        // 즉시 UI 업데이트 (Framer Motion이 애니메이션 처리)
        game.applyTurnResult(currentPieces)

        // 다음 이동 전 대기 (애니메이션 시간)
        await new Promise(resolve => setTimeout(resolve, 350))
      }

      // 카운트다운 처리
      const { updatedPieces: countdownPieces, events: countdownEvents } = tickCountdowns(currentPieces)
      countdownEvents.forEach(e => {
        game.addLogEntry('countdown', `${e.pieceId}: ${e.description}`)
      })

      // 봉인 상태 처리
      const finalPieces = tickSealedStatus(countdownPieces)

      // 최종 상태 적용
      game.applyTurnResult(finalPieces)
      run.addTurns(1)

      // 보스 페이즈 전환 체크
      if (game.isBossBattle) {
        const remainingEnemies = finalPieces.filter(p => p.owner === 'enemy' && !p.isDead).length
        const currentPhase = game.bossPhase

        // 페이즈 전환 로직 (남은 적 기물 수 기반)
        // 일반: Phase 2 at <=4, Phase 3 at <=2
        // 최종보스(10층 이상): Phase 2 at <=5, Phase 3 at <=3
        const isFinalBoss = run.currentFloor >= 30
        const phase2Threshold = isFinalBoss ? 5 : 4
        const phase3Threshold = isFinalBoss ? 3 : 2

        if (currentPhase === 1 && remainingEnemies <= phase2Threshold) {
          game.setBossPhase(2)
          game.addLogEntry('phase_change', '보스 제2단계 돌입!')
        } else if (currentPhase === 2 && remainingEnemies <= phase3Threshold) {
          game.setBossPhase(3)
          game.addLogEntry('phase_change', '보스 최종단계 돌입!')
        }
      }

    } catch (error) {
      console.error('Turn processing failed:', error)
    } finally {
      ui.setIsAnimating(false)
    }

    // 전투 종료 체크
    const result = game.checkBattleEnd()
    if (result !== 'ongoing') {
      if (result === 'victory') {
        run.completeCurrentNode()
        if (game.isBossBattle) {
          run.recordBossDefeat()
        }
        ui.setScreen('reward')
      } else {
        run.endRun('defeat')
        ui.setScreen('run_end')
      }
    }
  }, [game, run, ui, computeAITurn])

  // 전투 초기화
  const initBattle = useCallback((params: {
    playerPieces: PieceToken[]
    enemyPieces: PieceToken[]
    boardSize: 6 | 7 | 8
    dangerTiles?: Array<{ row: number; col: number; type: 'danger_spike' | 'danger_pit' | 'danger_lava' | 'ice' }>
    isBoss?: boolean
  }) => {
    game.initBattle(params)
    ui.setScreen('battle')
  }, [game, ui])

  return {
    handlePieceSelect,
    handleMoveReservation,
    handleCancelMove,
    handleEndTurn,
    initBattle,
  }
}
