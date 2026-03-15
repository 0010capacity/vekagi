// src/engine/collision.ts
// VANGUARD PUSH — 충돌 엔진 (순수 함수)
// 이 파일은 완성본입니다. 공식을 절대 수정하지 마세요.
/**
 * 핵심 충돌 공식
 * 밀려나는 칸 수 = 1 (기본) + max(0, 공격자 힘 - 피격자 질량)
 *
 * 설계 의도:
 * - 질량이 아무리 높아도 최소 1칸은 밀린다
 * - 힘이 질량보다 클수록 더 멀리 밀린다
 * - 플레이어가 항상 정확하게 계산 가능하다
 */
export function calculatePushDistance(attackerForce, targetMass) {
    return 1 + Math.max(0, attackerForce - targetMass);
}
/**
 * 연쇄 충돌 전달 힘
 * - 반환값 > 0: 연쇄 계속
 * - 반환값 <= 0: 연쇄 종료
 *
 * 관통(貫通) 특성: 이 함수를 사용하지 않고 원래 힘 그대로 전달
 */
export function calculateChainForce(attackerForce, targetMass) {
    return attackerForce - targetMass;
}
/**
 * 두 위치 사이의 방향 벡터 계산
 * (attacker → target 방향)
 */
export function getCollisionDirection(attacker, target) {
    return {
        dr: Math.sign(target.row - attacker.row),
        dc: Math.sign(target.col - attacker.col),
    };
}
/**
 * 특정 방향으로 N칸 밀렸을 때 최종 위치 계산
 * - 그리드 밖으로 나가면 position: null (사망)
 * - 다른 기물에 막히면 그 앞 칸에서 멈춤
 */
export function calculateFinalPosition(from, direction, distance, boardSize, board, movingPieceId) {
    let current = { ...from };
    for (let i = 0; i < distance; i++) {
        const next = {
            row: current.row + direction.dr,
            col: current.col + direction.dc,
        };
        // 그리드 밖 → 사망
        if (next.row < 0 || next.row >= boardSize ||
            next.col < 0 || next.col >= boardSize) {
            return { position: null, stoppedByPieceId: null };
        }
        // 다른 기물에 막힘 → 현재 칸에서 멈춤 (연쇄는 별도 처리)
        const occupant = board.pieces[next.row]?.[next.col];
        if (occupant && occupant.instanceId !== movingPieceId) {
            return { position: current, stoppedByPieceId: occupant.instanceId };
        }
        current = next;
    }
    return { position: current, stoppedByPieceId: null };
}
/**
 * 이동 가능한 칸에서 특정 방향으로 밀 때
 * 밀림 칸수 미리보기 (UI용)
 */
export function previewPushResult(attackerPosition, attackerForce, targetPiece, boardSize, board) {
    const direction = getCollisionDirection(attackerPosition, targetPiece.position);
    const pushDistance = calculatePushDistance(attackerForce, targetPiece.currentMass);
    const { position } = calculateFinalPosition(targetPiece.position, direction, pushDistance, boardSize, board, targetPiece.instanceId);
    return {
        pushDistance,
        finalPosition: position,
        willDie: position === null,
    };
}
/**
 * 위험 타일 판정
 */
export function isOnDangerTile(position, board) {
    const tile = board.tiles[position.row]?.[position.col];
    return tile !== undefined && tile !== 'normal';
}
/**
 * 얼음 타일 보너스: 얼음 위에서 밀리면 추가 1칸
 */
export function applyIceBonus(position, board, basePush) {
    const tile = board.tiles[position.row]?.[position.col];
    return tile === 'ice' ? basePush + 1 : basePush;
}
