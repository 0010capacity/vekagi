// src/data/formations.ts
// VANGUARD PUSH — 진형 카드 데이터 (24종)
// 이 파일은 완성본입니다.
export const FORMATIONS = [
    {
        id: 1, name: '일렬 횡대', sub: '기본 전선 진형',
        rarity: '기본', slots: 5, coreSlots: 0,
        gridPattern: '5기물을 가로 일렬로 배치',
        tags: ["공격 강화", "방어 강화"],
        effects: [
            {
                "type": "패시브",
                "text": "전열 기물 전체 힘 +1. 가로로 인접한 아군이 있을 때만 유지."
            },
            {
                "type": "조건부",
                "text": "전열 기물이 모두 초기 위치에 있을 때 질량 +1 추가."
            }
        ],
    },
    {
        id: 2, name: '쐐기 진형', sub: '돌파 특화 진형',
        rarity: '기본', slots: 5, coreSlots: 0,
        gridPattern: '삼각형 쐐기 형태. 선두 1 + 중열 2 + 후열 2',
        tags: ["공격 강화", "연쇄 특화"],
        effects: [
            {
                "type": "패시브",
                "text": "선두(최전방) 기물 힘 +2. 쐐기 형태가 유지될 때만 적용."
            },
            {
                "type": "조건부",
                "text": "선두 기물이 적을 밀어낼 때 연쇄 충돌 감쇠 없음."
            }
        ],
    },
    {
        id: 3, name: '방어 성벽', sub: '수비 철벽 진형',
        rarity: '기본', slots: 4, coreSlots: 0,
        gridPattern: '4기물 가로 일렬 (보드 중앙 전열)',
        tags: ["방어 강화", "생존"],
        effects: [
            {
                "type": "패시브",
                "text": "전열 기물 전체 질량 +2. 4기물이 연속 인접할 때만 유지."
            },
            {
                "type": "조건부",
                "text": "진형이 완전히 유지되면 최소 밀림 1칸 → 0칸으로 감소."
            }
        ],
    },
    {
        id: 4, name: '역삼각 진형', sub: '후방 지원 진형',
        rarity: '기본', slots: 5, coreSlots: 0,
        gridPattern: '역삼각형. 후열 2 + 중앙 핵심 1 + 전열 2',
        tags: ["방어 강화", "속도 강화"],
        effects: [
            {
                "type": "패시브",
                "text": "중앙(핵심 슬롯) 기물 민첩 +3. 핵심 슬롯이 비면 효과 소멸."
            },
            {
                "type": "조건부",
                "text": "후열 기물 2개가 모두 초기 위치면 전열 기물 질량 +1."
            }
        ],
    },
    {
        id: 5, name: '십자 진형', sub: '전방위 압박 진형',
        rarity: '기본', slots: 5, coreSlots: 1,
        gridPattern: '십자형. 핵심 중앙 1 + 4방향 각 1',
        tags: ["공격 강화", "특수"],
        effects: [
            {
                "type": "패시브",
                "text": "중앙(핵심) 기물 인접 4방향 기물 힘 +1."
            },
            {
                "type": "액티브",
                "text": "AP 2 소모. 핵심 기물 기준 4방향으로 동시에 1칸씩 밀어내기 실행. (1회/층)"
            }
        ],
    },
    {
        id: 6, name: '사선 진형', sub: '측면 강습 진형',
        rarity: '고급', slots: 4, coreSlots: 0,
        gridPattern: '대각선 4기물 일렬 배치',
        tags: ["공격 강화", "연쇄 특화"],
        effects: [
            {
                "type": "패시브",
                "text": "대각선 방향 이동 기물 힘 +2."
            },
            {
                "type": "조건부",
                "text": "대각 방향 이동 기물이 연쇄 충돌을 유발하면 추가 연쇄 1회 발동."
            }
        ],
    },
    {
        id: 7, name: '집중 진형', sub: '단일 돌파 진형',
        rarity: '고급', slots: 3, coreSlots: 1,
        gridPattern: '핵심 중앙 + 좌우 각 1',
        tags: ["공격 강화", "특수"],
        effects: [
            {
                "type": "패시브",
                "text": "핵심 기물 힘 +3, 민첩 +2. 단 AP 비용 +1."
            },
            {
                "type": "액티브",
                "text": "AP 2 소모. 핵심 기물의 이번 이동 충돌 피해 2배. (1회/층)"
            }
        ],
    },
    {
        id: 8, name: '산개 진형', sub: '분산 압박 진형',
        rarity: '고급', slots: 6, coreSlots: 0,
        gridPattern: '6기물을 보드 전체에 분산 배치 (서로 인접하지 않음)',
        tags: ["속도 강화", "특수"],
        effects: [
            {
                "type": "패시브",
                "text": "모든 기물 민첩 +1. 기물이 서로 인접하지 않을 때만 유지."
            },
            {
                "type": "조건부",
                "text": "적 기물이 아군 2기물 사이에 위치하면 해당 적 민첩 -3."
            }
        ],
    },
    {
        id: 9, name: '포위 진형', sub: '완전 포위 전략 진형',
        rarity: '고급', slots: 6, coreSlots: 0,
        gridPattern: '3×3 외곽을 6기물로 포위 (중앙 빈 칸 확보)',
        tags: ["연쇄 특화", "특수"],
        effects: [
            {
                "type": "패시브",
                "text": "포위된 적(6방향 중 4방향이 막힘) 힘 -2, 질량 -1."
            },
            {
                "type": "조건부",
                "text": "포위된 적을 밀어낼 때 밀림 칸수 +2."
            }
        ],
    },
    {
        id: 10, name: '파도 진형', sub: '순차 압박 진형',
        rarity: '고급', slots: 6, coreSlots: 0,
        gridPattern: '전열 3 + 후열 3 (2줄 파도 배치)',
        tags: ["공격 강화", "연쇄 특화"],
        effects: [
            {
                "type": "패시브",
                "text": "전열 기물이 이동 후, 후열 기물 힘 +1 적용 (다음 충돌에 한해)."
            },
            {
                "type": "조건부",
                "text": "전열 기물이 적을 밀어내면 후열 기물이 즉시 1칸 전진 가능 (AP 소모 없음)."
            }
        ],
    },
    {
        id: 11, name: '방패 원형', sub: '전방위 방어 진형',
        rarity: '고급', slots: 5, coreSlots: 1,
        gridPattern: '핵심 중앙 + 상하좌우 외곽 4기물 (십자형)',
        tags: ["방어 강화", "생존"],
        effects: [
            {
                "type": "패시브",
                "text": "외곽 기물 질량 +2. 핵심 기물은 고정대 특성 획득."
            },
            {
                "type": "액티브",
                "text": "AP 1 소모. 이번 턴 외곽 기물 중 1개가 밀려나도 효과 유지. (2회/층)"
            }
        ],
    },
    {
        id: 12, name: '봉황 진형', sub: '각성 전략 진형',
        rarity: '희귀', slots: 5, coreSlots: 1,
        gridPattern: '핵심 중앙 + 상하좌우 대각 날개 형태',
        tags: ["특수", "연쇄 특화"],
        effects: [
            {
                "type": "패시브",
                "text": "각성(N) 카운트다운 기물의 타이머 -1 (더 빨리 각성). 핵심 슬롯이 각성형 기물일 때만 적용."
            },
            {
                "type": "액티브",
                "text": "AP 3 소모. 핵심 기물 즉시 각성 발동. (1회/런)"
            }
        ],
    },
    {
        id: 13, name: '희생 진형', sub: '순교 전략 진형',
        rarity: '희귀', slots: 6, coreSlots: 1,
        gridPattern: '핵심(순교자 전용) 전방 + 나머지 5기물 보호 배치',
        tags: ["특수", "생존"],
        effects: [
            {
                "type": "패시브",
                "text": "핵심 슬롯: 순교자 기물 전용. 순교자 사망 시 인접 아군 힘 +2, 질량 +1."
            },
            {
                "type": "조건부",
                "text": "이번 층에서 아군 기물이 사망할 때마다 나머지 아군 전체 민첩 +1 (최대 +3)."
            }
        ],
    },
    {
        id: 14, name: '지뢰밭 진형', sub: '폭사 전략 진형',
        rarity: '희귀', slots: 5, coreSlots: 0,
        gridPattern: '폭사 기물 3개 + 지원 2개 교차 배치',
        tags: ["연쇄 특화", "공격 강화"],
        effects: [
            {
                "type": "패시브",
                "text": "폭사 기물의 폭발 범위 +1칸. 적이 폭사 기물에 인접 이동 시 민첩 -2."
            },
            {
                "type": "조건부",
                "text": "폭사가 연쇄로 다른 적을 밀어낼 때 추가 피해 없이 밀림 칸수 +1."
            }
        ],
    },
    {
        id: 15, name: '군주 진형', sub: '지휘 강화 진형',
        rarity: '희귀', slots: 5, coreSlots: 1,
        gridPattern: '핵심(군주) 중앙 + 전방 2 + 후방 2',
        tags: ["공격 강화", "속도 강화", "특수"],
        effects: [
            {
                "type": "패시브",
                "text": "핵심(군주) 기물 인접 아군 모두 힘 +1, 민첩 +1."
            },
            {
                "type": "액티브",
                "text": "AP 2 소모. 이번 턴 모든 아군 AP 비용 -1 (최솟값 1). (2회/층)"
            },
            {
                "type": "조건부",
                "text": "군주 기물이 살아있는 한 층 클리어 보상 선택지 +1개 추가."
            }
        ],
    },
    {
        id: 16, name: '카오스 진형', sub: '무질서 폭발 진형',
        rarity: '희귀', slots: 6, coreSlots: 0,
        gridPattern: '6기물 완전 무작위 배치 (랜덤 생성)',
        tags: ["연쇄 특화", "특수"],
        effects: [
            {
                "type": "패시브",
                "text": "아군 기물 충돌 시 밀림 칸수에 +1d3 랜덤 추가."
            },
            {
                "type": "조건부",
                "text": "랜덤 이동(?) 기물이 진형에 있을 때 해당 기물 힘 +3."
            }
        ],
    },
    {
        id: 17, name: '마그넷 진형', sub: '흡착 유도 진형',
        rarity: '희귀', slots: 5, coreSlots: 1,
        gridPattern: '핵심(마그넷) 중앙 + 주변 4기물',
        tags: ["특수", "연쇄 특화"],
        effects: [
            {
                "type": "패시브",
                "text": "핵심 기물은 도발 특성 획득. 적이 핵심 기물을 밀면 반탄 발동."
            },
            {
                "type": "액티브",
                "text": "AP 2 소모. 인접 3칸 내 적 기물 1개를 핵심 기물 옆으로 강제 이동. (2회/층)"
            }
        ],
    },
    {
        id: 18, name: '반사 진형', sub: '역이용 전략 진형',
        rarity: '희귀', slots: 4, coreSlots: 0,
        gridPattern: '반사경 기물 2개 + 지원 2개 대칭 배치',
        tags: ["방어 강화", "연쇄 특화"],
        effects: [
            {
                "type": "패시브",
                "text": "아군 기물이 밀려날 때 밀어낸 적에게 동일 칸수만큼 역방향 밀기 발동."
            },
            {
                "type": "조건부",
                "text": "반사로 밀려난 적이 다른 적에게 충돌하면 연쇄 감쇠 없음."
            }
        ],
    },
    {
        id: 19, name: '불사 진형', sub: '부활 전략 진형',
        rarity: '전설', slots: 5, coreSlots: 1,
        gridPattern: '핵심(부활 관리자) 중앙 + 대각 4기물',
        tags: ["생존", "특수"],
        effects: [
            {
                "type": "패시브",
                "text": "이 진형으로 사망한 기물은 다음 층 시작 시 절반 스탯으로 부활."
            },
            {
                "type": "액티브",
                "text": "AP 4 소모. 이번 층에서 죽은 아군 1기물 즉시 부활, 원래 위치에 배치. (1회/런)"
            },
            {
                "type": "조건부",
                "text": "핵심 기물이 살아있는 한 지휘관 사망 피해 -1."
            }
        ],
    },
    {
        id: 20, name: '폭풍 진형', sub: '극한 공세 진형',
        rarity: '전설', slots: 6, coreSlots: 1,
        gridPattern: '핵심(폭풍의 눈) 전방 + 방사형 5기물',
        tags: ["공격 강화", "연쇄 특화", "특수"],
        effects: [
            {
                "type": "패시브",
                "text": "핵심 기물 힘 +3. 아군 기물이 연쇄 충돌을 발생시킬 때마다 핵심 기물 힘 추가 +1 (최대 +5)."
            },
            {
                "type": "액티브",
                "text": "AP 3 소모. 이번 턴 모든 아군 기물 힘 +2. (2회/층)"
            },
            {
                "type": "조건부",
                "text": "아군 기물이 사망할 때마다 나머지 아군 힘 +1. 단 양날의검 효과도 적용."
            }
        ],
    },
    {
        id: 21, name: '영원의 성채', sub: '극한 방어 진형',
        rarity: '전설', slots: 6, coreSlots: 1,
        gridPattern: '핵심 중앙 + 외곽 5기물 성채 형태',
        tags: ["방어 강화", "생존", "특수"],
        effects: [
            {
                "type": "패시브",
                "text": "외곽 기물 질량 +3. 핵심 기물은 고정대 + 가시 특성 동시 획득."
            },
            {
                "type": "액티브",
                "text": "AP 2 소모. 이번 턴 아군 전체 밀림 0칸. (2회/층)"
            },
            {
                "type": "조건부",
                "text": "진형이 완전히 유지되면 매 턴 시작 시 지휘관 HP +1 회복."
            }
        ],
    },
    {
        id: 22, name: '심판의 십자가', sub: '처형 특화 진형',
        rarity: '전설', slots: 5, coreSlots: 1,
        gridPattern: '핵심 중앙 + 상하좌우 직선 각 1 (십자가 형태)',
        tags: ["공격 강화", "특수", "연쇄 특화"],
        effects: [
            {
                "type": "패시브",
                "text": "핵심 기물이 이동할 때 직선 경로상 모든 기물에 관통 충돌 발동."
            },
            {
                "type": "액티브",
                "text": "AP 4 소모. 핵심 기물 기준 4방향 직선상 모든 적 그리드 끝까지 밀어내기. (1회/런)"
            },
            {
                "type": "조건부",
                "text": "십자 방향 4슬롯이 모두 채워지면 핵심 기물 힘 = 전체 아군 기물 힘의 합."
            }
        ],
    },
    {
        id: 23, name: '시간의 모래시계', sub: '카운트다운 특화 진형',
        rarity: '전설', slots: 6, coreSlots: 2,
        gridPattern: '모래시계 형태. 상단 3 + 핵심 2 중앙 + 하단 3',
        tags: ["특수", "연쇄 특화"],
        effects: [
            {
                "type": "패시브",
                "text": "카운트다운 기물 타이머 매 턴 2씩 감소. 핵심 슬롯 2개 모두 카운트다운 기물이어야 함."
            },
            {
                "type": "액티브",
                "text": "AP 3 소모. 아군 기물 1개 카운트다운 즉시 발동. (2회/층)"
            },
            {
                "type": "조건부",
                "text": "이번 층에서 각성이 발동될 때마다 플레이어 AP +1 획득."
            }
        ],
    },
    {
        id: 24, name: '공허의 군주', sub: '제어 불능 극한 진형',
        rarity: '전설', slots: 6, coreSlots: 2,
        gridPattern: '핵심 2개 대각 + 나머지 4기물 분산',
        tags: ["특수", "공격 강화", "연쇄 특화"],
        effects: [
            {
                "type": "패시브",
                "text": "모든 아군 기물 힘 +2, 질량 -2 (최솟값 1). 강력하지만 밀려나기 쉬워짐."
            },
            {
                "type": "액티브",
                "text": "AP 5 소모. 이번 턴 모든 아군 기물이 동시에 행동. 우선권 계산 없이 지정 순서대로 실행. (1회/런)"
            },
            {
                "type": "조건부",
                "text": "아군 기물이 그리드 밖으로 밀려나도 지휘관 피해 없음. 단 해당 기물 다음 층 절반 스탯으로 부활."
            }
        ],
    },
];
export const getFormationById = (id) => FORMATIONS.find(f => f.id === id);
export const getFormationsByRarity = (rarity) => FORMATIONS.filter(f => f.rarity === rarity);
