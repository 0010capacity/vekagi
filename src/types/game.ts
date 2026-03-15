// src/types/game.ts
// VANGUARD PUSH — 전체 타입 정의
// 이 파일은 완성본입니다. 수정하지 마세요.

// ── 기물 관련 타입 ──────────────────────────────────────

export type MoveType =
  | '주(主)'    // 상하좌우 1칸
  | '사(斜)'    // 대각선 1칸
  | '전(全)'    // 8방향 1칸
  | '십자(十)'  // 상하좌우 최대 3칸
  | '사선(╲)'  // 대각 최대 3칸
  | '도약(♞)'  // L자 이동
  | '전진(↑)'  // 전방 1칸만
  | '역주(↓)'  // 후방 1칸만
  | '돌진(⇒)'  // 장애물까지 직진
  | '고정(■)'  // 이동 불가
  | '랜덤(?)'; // 매 턴 랜덤

export type PieceCategory =
  | '전사형' | '지원형' | '카운트다운형' | '특수이동형' | '복합형';

export type TraitCategory =
  | '사망' | '충돌' | '버프' | '디버프' | '카운트다운' | '기타';

export interface CountdownEffect {
  type: 'awaken' | 'collapse' | 'summon' | 'seal';
  turns: number;
  currentTurns: number;
  description: string;
}

export interface PieceDefinition {
  id: number;
  name: string;
  category: PieceCategory;
  move: MoveType;
  force: number;
  mass: number;
  agility: number;
  ap: number;
  traits: string[];
  countdown?: CountdownEffect;
  desc: string;
}

export interface PieceToken {
  instanceId: string;
  definitionId: number;
  owner: 'player' | 'enemy';
  position: Position;
  currentForce: number;
  currentMass: number;
  currentAgility: number;
  activeTraits: string[];
  countdown?: CountdownEffect;
  statusEffects: StatusEffect[];
  isSealed: boolean;
  isDead: boolean;
}

export interface StatusEffect {
  type: 'sealed' | 'buffed' | 'debuffed' | 'marked';
  value: number;
  remainingTurns: number;
}

// ── 보드 관련 타입 ──────────────────────────────────────

export interface Position {
  row: number;
  col: number;
}

export type BoardSize = 6 | 7 | 8;

export type TileType = 'normal' | 'danger_spike' | 'danger_pit' | 'danger_lava' | 'ice';

export interface BoardState {
  size: BoardSize;
  tiles: TileType[][];
  pieces: (PieceToken | null)[][];
}

// ── 진형 관련 타입 ──────────────────────────────────────

export type FormationRarity = '기본' | '고급' | '희귀' | '전설';

export interface FormationEffect {
  type: '패시브' | '액티브' | '조건부';
  text: string;
  apCost?: number;
  usesPerFloor?: number;
  usesPerRun?: number;
}

export interface Formation {
  id: number;
  name: string;
  sub: string;
  rarity: FormationRarity;
  slots: number;
  coreSlots: number;
  gridPattern: string;
  tags: string[];
  effects: FormationEffect[];
}

// ── 맵 관련 타입 ──────────────────────────────────────

export type TurnPhase = 'plan' | 'resolve' | 'execute' | 'countdown' | 'end';

export type NodeType = 'battle' | 'elite' | 'rest' | 'shop' | 'event' | 'boss';

export interface MapNode {
  id: string;
  type: NodeType;
  floor: number;
  zone: 1 | 2 | 3;
  connections: string[];
  completed: boolean;
}

export interface RunMap {
  nodes: MapNode[];
  currentNodeId: string;
}

export interface Currencies {
  전투결정: number;
  정예결정: number;
  공허파편: number;
}

// ── 게임 상태 타입 ──────────────────────────────────────

export interface PendingMove {
  pieceId: string;
  from: Position;
  to: Position;
  apCost: number;
}

export interface CombatLogEntry {
  turn: number;
  type: 'move' | 'collision' | 'chain' | 'death' | 'countdown' | 'phase_change';
  message: string;
  positions?: { from: Position; to: Position };
}

export interface GameState {
  board: BoardState;
  playerPieces: PieceToken[];
  enemyPieces: PieceToken[];
  currentAP: number;
  maxAP: number;
  turnNumber: number;
  phase: TurnPhase;
  selectedPieceId: string | null;
  pendingMoves: PendingMove[];
  turnOrder: string[];
  combatLog: CombatLogEntry[];
  activeFormationEffects: FormationEffect[];
  isBossBattle: boolean;
  bossPhase: 1 | 2 | 3;
}

export interface RunStats {
  totalTurns: number;
  totalDeaths: number;
  maxChainCollision: number;
  floorsCleared: number;
  bossesDefeated: number;
}

export interface RunState {
  commanderHP: number;
  maxCommanderHP: number;
  ownedPieces: PieceDefinition[];
  ownedFormations: Formation[];
  activeFormation: Formation | null;
  currentZone: 1 | 2 | 3;
  currentFloor: number;
  currencies: Currencies;
  runMap: RunMap;
  pieceSlots: number;
  defeatedPieces: number[];
  isRunActive: boolean;
  runResult: 'ongoing' | 'victory' | 'defeat' | null;
  stats: RunStats;
}

export interface AnimationEntry {
  type: 'move' | 'collision' | 'chain' | 'death' | 'spawn' | 'phase_change';
  pieceId: string;
  from?: Position;
  to?: Position;
  delay: number;
}

export interface UIState {
  currentScreen: 'main_menu' | 'piece_pick' | 'run_map' | 'formation_setup' | 'battle' | 'reward' | 'shop' | 'event' | 'run_end';
  modalOpen: 'shop' | 'event' | 'reward' | 'formation' | 'piece_detail' | null;
  selectedPieceForModal: PieceDefinition | null;
  hoveredCell: Position | null;
  previewMoves: Position[];
  previewPushResult: Map<string, number>;
  animationQueue: AnimationEntry[];
  isAnimating: boolean;
}

// ── AI 관련 타입 ──────────────────────────────────────

export type AIArchetype =
  | 'aggressive' | 'pressure' | 'protective'
  | 'kamikaze' | 'spawner' | 'chaos';

export interface AIAction {
  pieceId: string;
  targetPosition: Position;
  priority: number;
}

export interface IntentArrow {
  pieceId: string;
  from: Position;
  to: Position;
  direction: 'up' | 'down' | 'left' | 'right' | 'none';
}

export interface AIWorkerMessage {
  type: 'compute_turn';
  gameState: GameState;
  aiPieces: PieceToken[];
  archetype: AIArchetype;
  difficulty: 1 | 2 | 3;
}

export interface AIWorkerResponse {
  type: 'turn_computed';
  actions: AIAction[];
  intentArrows: IntentArrow[];
}
