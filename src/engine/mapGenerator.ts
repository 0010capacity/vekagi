// src/engine/mapGenerator.ts
// 런 맵 생성 (순수 함수)

import type { MapNode, NodeType, RunMap } from '@/types/game'

const ZONE_FLOORS = { 1: 10, 2: 10, 3: 10 } as const

/**
 * 런 맵 생성: 3구역 × 10층 + 보스 = 약 33~36 노드
 * Slay the Spire 방식의 분기 맵
 */
export function generateRunMap(): RunMap {
  const nodes: MapNode[] = []
  let nodeIdCounter = 0

  const makeId = () => `node_${nodeIdCounter++}`

  // 구역별 층 생성
  for (let zone = 1 as 1 | 2 | 3; zone <= 3; zone++) {
    for (let floor = 1; floor <= ZONE_FLOORS[zone]; floor++) {
      const absoluteFloor = (zone - 1) * 10 + floor
      const type = pickNodeType(zone, floor)
      nodes.push({
        id: makeId(),
        type,
        floor: absoluteFloor,
        zone,
        connections: [], // 아래서 연결
        completed: false,
      })
    }
    // 구역 보스
    nodes.push({
      id: makeId(),
      type: 'boss',
      floor: zone * 10,
      zone,
      connections: [],
      completed: false,
    })
  }

  // 분기 연결 생성 (각 노드에서 2~3개의 다음 노드 연결)
  connectNodes(nodes)

  return {
    nodes,
    currentNodeId: nodes[0].id,
  }
}

function pickNodeType(zone: number, floor: number): NodeType {
  if (floor === 10) return 'boss'

  const roll = Math.random()
  // 구역별 난이도 조절
  const eliteChance = zone === 1 ? 0.10 : zone === 2 ? 0.15 : 0.20
  const restChance = 0.10
  const shopChance = 0.10
  const eventChance = 0.10

  // 비율: 전투 > 정예 > 거점 ≈ 상인 ≈ 이벤트
  if (roll < 1 - eliteChance - restChance - shopChance - eventChance) return 'battle'
  if (roll < 1 - restChance - shopChance - eventChance) return 'elite'
  if (roll < 1 - shopChance - eventChance) return 'rest'
  if (roll < 1 - eventChance) return 'shop'
  return 'event'
}

function connectNodes(nodes: MapNode[]): void {
  // 층별로 그룹화 후 다음 층의 노드들과 연결
  const byFloor = new Map<number, MapNode[]>()
  nodes.forEach(n => {
    if (!byFloor.has(n.floor)) byFloor.set(n.floor, [])
    byFloor.get(n.floor)!.push(n)
  })

  const floors = Array.from(byFloor.keys()).sort((a, b) => a - b)
  floors.forEach((floor, idx) => {
    if (idx === floors.length - 1) return
    const current = byFloor.get(floor)!
    const next = byFloor.get(floors[idx + 1])!

    current.forEach(node => {
      // 각 노드에서 다음 층 1~2개 노드로 연결
      const count = Math.min(next.length, 1 + Math.floor(Math.random() * 2))
      const shuffled = [...next].sort(() => Math.random() - 0.5)
      node.connections = shuffled.slice(0, count).map(n => n.id)
    })
  })
}

/**
 * 현재 노드에서 이동 가능한 다음 노드들 반환
 */
export function getAvailableNextNodes(map: RunMap): MapNode[] {
  const currentNode = map.nodes.find(n => n.id === map.currentNodeId)
  if (!currentNode) return []

  return currentNode.connections
    .map(id => map.nodes.find(n => n.id === id))
    .filter((n): n is MapNode => n !== undefined && !n.completed)
}

/**
 * 특정 노드로 이동
 */
export function moveToNode(map: RunMap, nodeId: string): RunMap | null {
  const currentNode = map.nodes.find(n => n.id === map.currentNodeId)
  if (!currentNode) return null

  if (!currentNode.connections.includes(nodeId)) return null

  return {
    ...map,
    nodes: map.nodes.map(n =>
      n.id === map.currentNodeId
        ? { ...n, completed: true }
        : n
    ),
    currentNodeId: nodeId,
  }
}

/**
 * 맵 노드 타입별 아이콘 반환
 */
export function getNodeIcon(type: NodeType): string {
  switch (type) {
    case 'battle': return '⚔'
    case 'elite': return '★'
    case 'rest': return '⌂'
    case 'shop': return '$'
    case 'event': return '?'
    case 'boss': return '☠'
  }
}
