// src/screens/Battle.tsx
// 전투 화면

import { GameBoard } from '@/components/board/GameBoard'
import { APBar } from '@/components/hud/APBar'
import { HPBar } from '@/components/hud/HPBar'
import { CountdownTimer } from '@/components/hud/CountdownTimer'
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
  const { handleEndTurn, handlePieceSelect } = useGameEngine()

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* 상단 HUD */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <span className="text-sm text-slate-400">
          구역 {run.currentZone} · 층 {run.currentFloor}
          {game.isBossBattle && <span className="text-red-400 ml-2">[보스전]</span>}
        </span>
        <HPBar current={run.commanderHP} max={run.maxCommanderHP} />
        <span className="text-sm text-slate-400">턴 {game.turnNumber}</span>
      </div>

      {/* 메인 영역 */}
      <div className="flex flex-col lg:flex-row flex-1 gap-4 p-4">
        {/* 보드 */}
        <div className="flex flex-col items-center justify-center gap-4 lg:flex-1">
          <GameBoard />

          {/* 카운트다운 표시 */}
          <CountdownTimer pieces={[...game.playerPieces, ...game.enemyPieces]} />
        </div>

        {/* 사이드 패널 - 모바일에서 하단 스크롤 */}
        <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto pb-2 lg:pb-0">
          {/* 아군 기물 */}
          <div className="flex flex-row lg:flex-col gap-2">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide whitespace-nowrap self-center lg:self-start lg:mb-1">
              아군
            </div>
            {game.playerPieces.filter(p => !p.isDead).map(piece => {
              const def = PIECES.find(p => p.id === piece.definitionId)
              if (!def) return null
              return (
                <button
                  key={piece.instanceId}
                  onClick={() => handlePieceSelect(piece.instanceId)}
                  className="text-left flex-shrink-0 lg:w-full"
                >
                  <PieceCard
                    piece={def}
                    compact
                    selected={game.selectedPieceId === piece.instanceId}
                  />
                </button>
              )
            })}
          </div>

          {/* 적 기물 표시 */}
          <div className="flex flex-row lg:flex-col gap-2 lg:mt-4">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide whitespace-nowrap self-center lg:self-start lg:mb-1">
              적 ({game.enemyPieces.filter(p => !p.isDead).length})
            </div>
            {game.enemyPieces.filter(p => !p.isDead).map(piece => {
              const def = PIECES.find(p => p.id === piece.definitionId)
              if (!def) return null
              return (
                <div key={piece.instanceId} className="opacity-60 flex-shrink-0 lg:w-full">
                  <PieceCard piece={def} compact />
                </div>
              )
            })}
          </div>

          {/* 전투 로그 - 데스크톱에서만 */}
          <div className="hidden lg:block mt-auto">
            <div className="text-xs text-slate-500 mb-1">전투 로그</div>
            <div className="bg-slate-900 rounded p-2 max-h-32 overflow-y-auto text-xs text-slate-400">
              {game.combatLog.slice(-5).map((log, i) => (
                <div key={i}>[T{log.turn}] {log.message}</div>
              ))}
              {game.combatLog.length === 0 && (
                <div className="text-slate-600">전투 시작...</div>
              )}
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
            onClick={() => {
              // 예약된 이동 모두 취소
              game.pendingMoves.forEach(m => game.cancelMove(m.pieceId))
              handlePieceSelect(null)
            }}
          >
            초기화
          </button>
          <button
            disabled={ui.isAnimating || game.phase !== 'plan'}
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
