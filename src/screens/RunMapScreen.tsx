// src/screens/RunMapScreen.tsx
// 런 맵 화면

import { useRunStore } from '@/stores/runStore'
import { useUIStore } from '@/stores/uiStore'
import { RunMap } from '@/components/map/RunMap'
import { HPBar } from '@/components/hud/HPBar'
import { useGameEngine } from '@/hooks/useGameEngine'
import type { MapNode, NodeType } from '@/types/game'
import { PIECES } from '@/data/pieces'

export function RunMapScreen() {
  const run = useRunStore()
  const { setScreen } = useUIStore()
  const { initBattle } = useGameEngine()

  // 노드 타입별 화면 전환
  const handleNodeClick = (node: MapNode) => {
    run.setCurrentNodeId(node.id)

    switch (node.type) {
      case 'battle':
      case 'elite':
      case 'boss':
        startBattle(node.type)
        break
      case 'rest':
        run.healCommander(5)
        run.completeCurrentNode()
        break
      case 'shop':
        setScreen('shop')
        break
      case 'event':
        setScreen('event')
        break
    }
  }

  const startBattle = (type: NodeType) => {
    // 간단한 적 생성 (실제로는 난이도 기반)
    const enemyCount = type === 'boss' ? 1 : type === 'elite' ? 4 : 3
    const enemyPieces = PIECES
      .filter(p => p.category === '전사형')
      .slice(0, enemyCount)
      .map((p, i) => ({
        instanceId: `enemy-${i}`,
        definitionId: p.id,
        owner: 'enemy' as const,
        position: { row: 0, col: i },
        currentForce: p.force,
        currentMass: p.mass,
        currentAgility: p.agility,
        activeTraits: [...p.traits],
        statusEffects: [],
        isSealed: false,
        isDead: false,
      }))

    // 플레이어 기물 생성
    const playerPieces = run.ownedPieces.slice(0, run.pieceSlots).map((p, i) => ({
      instanceId: `player-${i}`,
      definitionId: p.id,
      owner: 'player' as const,
      position: { row: 5, col: i + 1 },
      currentForce: p.force,
      currentMass: p.mass,
      currentAgility: p.agility,
      activeTraits: [...p.traits],
      statusEffects: [],
      isSealed: false,
      isDead: false,
    }))

    initBattle({
      playerPieces,
      enemyPieces,
      boardSize: 6,
      isBoss: type === 'boss',
    })
    // 노드 완료 처리는 전투 승리 시 useGameEngine의 handleEndTurn에서 수행
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* 상단 HUD */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
        <div className="text-sm text-slate-400">
          구역 {run.currentZone} · 층 {run.currentFloor}
        </div>
        <HPBar current={run.commanderHP} max={run.maxCommanderHP} />
        <div className="flex gap-3 text-sm">
          <span className="text-yellow-400">◆ {run.currencies.전투결정}</span>
          <span className="text-blue-400">◈ {run.currencies.정예결정}</span>
          <span className="text-purple-400">✦ {run.currencies.공허파편}</span>
        </div>
      </div>

      {/* 맵 영역 - 중앙 정렬 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <RunMap onNodeClick={handleNodeClick} />
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="px-4 py-3 bg-slate-900 border-t border-slate-700 text-center">
        <div className="text-xs text-slate-400">
          보유 기물: {run.ownedPieces.length}개 · 슬롯: {run.pieceSlots}개
        </div>
      </div>
    </div>
  )
}
