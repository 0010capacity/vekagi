// src/data/index.ts
// 데이터 파일 통합 export

export { PIECES, getPieceById, getPiecesByCategory, MOVE_TYPES, TRAIT_DEFINITIONS } from './pieces';
export { FORMATIONS, getFormationById, getFormationsByRarity } from './formations';
export { BOSSES, getBossByZone } from './bosses';
export { EVENTS, getRandomEvent, getEventsByType } from './events';
export { SHOP, getShopCategory } from './shop';
