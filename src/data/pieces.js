// src/data/pieces.ts
// VANGUARD PUSH — 기물 데이터 (50종)
// 이 파일은 완성본입니다.
export const PIECES = [
    {
        id: 1, name: '보병', category: '전사형',
        move: '주(主)', force: 2, mass: 2, agility: 2, ap: 1,
        traits: [],
        desc: '가장 기본적인 기물. 특성 없이 안정적으로 운용 가능하다.',
    },
    {
        id: 2, name: '중갑병', category: '전사형',
        move: '주(主)', force: 2, mass: 5, agility: 1, ap: 2,
        traits: ["고정대"],
        desc: '극도로 무거워 어떤 충돌에도 밀려나지 않는다. 느리지만 철벽 같은 존재.',
    },
    {
        id: 3, name: '돌격대', category: '전사형',
        move: '돌진(⇒)', force: 4, mass: 2, agility: 4, ap: 2,
        traits: ["관통"],
        desc: '선택한 방향으로 장애물에 닿을 때까지 돌진. 관통으로 연쇄 밀기가 가능하다.',
    },
    {
        id: 4, name: '척후병', category: '전사형',
        move: '전(全)', force: 1, mass: 1, agility: 5, ap: 1,
        traits: ["은신"],
        desc: '거의 항상 먼저 행동. 적 계획에서 무시되어 기습 포지셔닝이 가능하다.',
    },
    {
        id: 5, name: '투사', category: '전사형',
        move: '주(主)', force: 5, mass: 2, agility: 2, ap: 2,
        traits: ["양날의검"],
        desc: '최강의 밀기 힘. 하지만 죽으면 지휘관이 추가로 -2 피해를 받는다.',
    },
    {
        id: 6, name: '방패병', category: '전사형',
        move: '주(主)', force: 1, mass: 4, agility: 2, ap: 1,
        traits: ["반탄"],
        desc: '밀려날 때 공격자도 반대 방향으로 같이 밀려난다. 방어적 진형의 핵심.',
    },
    {
        id: 7, name: '가시병', category: '전사형',
        move: '사(斜)', force: 2, mass: 3, agility: 2, ap: 1,
        traits: ["가시"],
        desc: '자신을 밀어낸 기물에게 역충돌 피해를 준다. 적이 밀기를 꺼리게 만든다.',
    },
    {
        id: 8, name: '창기병', category: '전사형',
        move: '십자(十)', force: 3, mass: 2, agility: 3, ap: 2,
        traits: ["관통"],
        desc: '직선 방향으로 멀리 이동하며 관통 충돌. 전선 돌파에 특화된 기물.',
    },
    {
        id: 9, name: '경기병', category: '전사형',
        move: '도약(♞)', force: 3, mass: 2, agility: 4, ap: 2,
        traits: [],
        desc: 'L자 이동으로 기물 위를 뛰어넘는다. 포위망 돌파나 적 후방 침투에 탁월.',
    },
    {
        id: 10, name: '선봉대', category: '전사형',
        move: '전진(↑)', force: 4, mass: 3, agility: 3, ap: 1,
        traits: [],
        desc: '앞으로만 이동하지만 힘이 강해 전선 돌파에 특화. AP 소모가 적다.',
    },
    {
        id: 11, name: '광전사', category: '전사형',
        move: '돌진(⇒)', force: 5, mass: 1, agility: 3, ap: 2,
        traits: ["양날의검", "관통"],
        desc: '엄청난 파괴력으로 여러 기물을 연속 밀어내지만, 죽으면 지휘관 -2.',
    },
    {
        id: 12, name: '후위병', category: '전사형',
        move: '역주(↓)', force: 3, mass: 4, agility: 2, ap: 1,
        traits: ["반탄"],
        desc: '뒤로만 이동하며 후방을 단단히 지킨다. 반탄으로 역습을 유도.',
    },
    {
        id: 13, name: '군악대', category: '지원형',
        move: '고정(■)', force: 1, mass: 2, agility: 1, ap: 1,
        traits: ["고취"],
        desc: '이동 불가지만 인접 아군 힘 +1. 전선 지원의 핵심 기물.',
    },
    {
        id: 14, name: '방어대장', category: '지원형',
        move: '주(主)', force: 1, mass: 3, agility: 2, ap: 2,
        traits: ["방벽"],
        desc: '인접 아군 질량 +1. 진형 전체를 단단하게 묶어주는 수비 지원.',
    },
    {
        id: 15, name: '전령', category: '지원형',
        move: '전(全)', force: 1, mass: 1, agility: 5, ap: 1,
        traits: ["가속"],
        desc: '인접 아군 민첩 +2. 이동 순서를 조율하여 아군이 먼저 행동하게 만든다.',
    },
    {
        id: 16, name: '교란병', category: '지원형',
        move: '사(斜)', force: 1, mass: 2, agility: 3, ap: 1,
        traits: ["교란"],
        desc: '인접 적 민첩 -2. 우선권을 빼앗아 상대의 계획을 순서부터 망친다.',
    },
    {
        id: 17, name: '약화술사', category: '지원형',
        move: '고정(■)', force: 1, mass: 2, agility: 2, ap: 1,
        traits: ["약화"],
        desc: '인접 적 힘 -1. 이동 불가지만 적의 밀기 능력을 꾸준히 떨어뜨린다.',
    },
    {
        id: 18, name: '깃발수', category: '지원형',
        move: '주(主)', force: 1, mass: 2, agility: 3, ap: 1,
        traits: ["고취", "무른"],
        desc: '아군 힘을 올려주지만 죽어도 지휘관 피해 없음. 소모품형 지원 기물.',
    },
    {
        id: 19, name: '성역사제', category: '지원형',
        move: '고정(■)', force: 1, mass: 3, agility: 1, ap: 2,
        traits: ["방벽", "고정대"],
        desc: '이동 불가, 밀려나지 않음. 인접 아군 질량+1을 안정적으로 제공하는 요새.',
    },
    {
        id: 20, name: '도발사', category: '지원형',
        move: '고정(■)', force: 1, mass: 5, agility: 1, ap: 2,
        traits: ["도발", "고정대"],
        desc: '적의 행동을 모두 이 기물로 끌어들인다. 다른 기물을 보호하는 미끼.',
    },
    {
        id: 21, name: '전이체', category: '지원형',
        move: '고정(■)', force: 1, mass: 2, agility: 3, ap: 2,
        traits: ["특수: 아군 2기물 위치 교환 (1회)"],
        desc: '이동 대신 아군 두 기물의 위치를 즉시 교환. 진형을 순식간에 재배치한다.',
    },
    {
        id: 22, name: '순교기사', category: '지원형',
        move: '주(主)', force: 2, mass: 2, agility: 2, ap: 1,
        traits: ["순교자"],
        desc: '사망 시 지휘관 +1 HP. 전략적 희생의 상징. 살신성인의 기물.',
    },
    {
        id: 23, name: '유충', category: '카운트다운형',
        move: '주(主)', force: 1, mass: 1, agility: 2, ap: 1,
        traits: ["각성(3): 번식체로 변화"],
        desc: '3턴 후 주변에 기물을 생성하는 번식체로 각성한다. 초반엔 매우 약함.',
    },
    {
        id: 24, name: '번식체', category: '카운트다운형',
        move: '고정(■)', force: 2, mass: 3, agility: 1, ap: 2,
        traits: ["소환(2): 매 2턴 인접 빈 칸에 보병 생성"],
        desc: '유충의 각성 형태. 끊임없이 보병을 생산하는 생산 기지.',
    },
    {
        id: 25, name: '시한폭탄', category: '카운트다운형',
        move: '고정(■)', force: 1, mass: 2, agility: 1, ap: 1,
        traits: ["붕괴(3)", "무른", "폭사"],
        desc: '3턴 후 인접 2칸 기물을 강하게 밀어내고 사망. 지휘관 피해 없음.',
    },
    {
        id: 26, name: '봉인기사', category: '카운트다운형',
        move: '고정(■)', force: 1, mass: 4, agility: 1, ap: 1,
        traits: ["봉인(3)", "각성(3): 폭군으로 변화"],
        desc: '처음 3턴간 이동 불가. 이후 힘 5의 폭군으로 각성한다.',
    },
    {
        id: 27, name: '각성기사', category: '카운트다운형',
        move: '주(主)', force: 2, mass: 2, agility: 2, ap: 1,
        traits: ["각성(4): 힘+3, 이동 전(全)으로 변화"],
        desc: '4턴 후 전 방향 이동 가능한 강력 기물로 각성한다. 장기 투자형.',
    },
    {
        id: 28, name: '불사조', category: '카운트다운형',
        move: '사(斜)', force: 3, mass: 2, agility: 4, ap: 2,
        traits: ["붕괴(5)", "각성(1): 사망 다음 턴 힘+1로 재소환"],
        desc: '5턴 후 죽지만, 다음 턴 더 강해진 형태로 같은 자리에 부활한다.',
    },
    {
        id: 29, name: '성장체', category: '카운트다운형',
        move: '주(主)', force: 1, mass: 1, agility: 1, ap: 1,
        traits: ["각성: 매 턴 힘·질량 +1 (최대 5)"],
        desc: '초반엔 극도로 약하지만 살아남을수록 강해진다. 생존이 곧 강함.',
    },
    {
        id: 30, name: '저주받은 기사', category: '카운트다운형',
        move: '전(全)', force: 4, mass: 3, agility: 4, ap: 2,
        traits: ["각성(2): 붕괴(3) + 양날의검 활성화"],
        desc: '2턴간 강력하게 운용 가능. 이후 3턴 카운트다운 후 폭사, 지휘관 -2.',
    },
    {
        id: 31, name: '연금술사', category: '카운트다운형',
        move: '사(斜)', force: 1, mass: 2, agility: 3, ap: 2,
        traits: ["소환(3): 3턴마다 랜덤 기물 생성"],
        desc: '3턴마다 예측 불가한 기물을 생성. 카오스 전략의 핵심 기물.',
    },
    {
        id: 32, name: '서리마녀', category: '카운트다운형',
        move: '사선(╲)', force: 1, mass: 2, agility: 3, ap: 2,
        traits: ["각성(3): 교란 범위 3칸으로 확장"],
        desc: '각성 후 광역 교란. 적 우선권을 대규모로 떨어뜨려 전장을 제압한다.',
    },
    {
        id: 33, name: '폭군', category: '카운트다운형',
        move: '십자(十)', force: 5, mass: 1, agility: 2, ap: 3,
        traits: ["양날의검"],
        desc: '봉인기사의 각성 형태. 극강의 힘이지만 취약하고 AP 소모가 크다.',
    },
    {
        id: 34, name: '씨앗병', category: '카운트다운형',
        move: '전진(↑)', force: 1, mass: 1, agility: 3, ap: 1,
        traits: ["소환(2): 전진 방향에 약한 기물 생성", "무른"],
        desc: '매 2턴 전진 방향 칸에 약한 기물을 심는다. 죽어도 지휘관 피해 없음.',
    },
    {
        id: 35, name: '봉인사', category: '카운트다운형',
        move: '주(主)', force: 1, mass: 2, agility: 3, ap: 2,
        traits: ["특수: 인접 적 1기물 봉인(3) — 3턴간 이동불가"],
        desc: '강적을 3턴간 이동 불가 상태로 묶어두는 전략 기물. 시간을 사는 기물.',
    },
    {
        id: 36, name: '도약사', category: '특수이동형',
        move: '도약(♞)', force: 3, mass: 2, agility: 5, ap: 2,
        traits: [],
        desc: '빠른 L자 이동. 포위된 아군을 구하거나 적 후방 침투에 특화된 기동 기물.',
    },
    {
        id: 37, name: '관통창', category: '특수이동형',
        move: '십자(十)', force: 4, mass: 2, agility: 3, ap: 2,
        traits: ["관통", "양날의검"],
        desc: '직선으로 여러 기물을 연속 밀어내는 최강 라인 기물. 죽으면 지휘관 -2.',
    },
    {
        id: 38, name: '역행자', category: '특수이동형',
        move: '역주(↓)', force: 2, mass: 4, agility: 2, ap: 1,
        traits: ["반탄"],
        desc: '뒤로만 이동. 후방에서 밀어오는 적을 반탄으로 역습하는 후방 수호자.',
    },
    {
        id: 39, name: '방랑기사', category: '특수이동형',
        move: '랜덤(?)', force: 3, mass: 3, agility: 3, ap: 1,
        traits: [],
        desc: 'AP 소모가 적지만 이동방식이 매 턴 랜덤. 불확실성을 즐기는 카오스 픽.',
    },
    {
        id: 40, name: '지하병', category: '특수이동형',
        move: '고정(■)', force: 3, mass: 3, agility: 2, ap: 2,
        traits: ["특수: 매 2턴 인접 기물 1개 끌어당김"],
        desc: '이동 대신 인접 적을 자신 쪽으로 끌어와 위험 타일이나 아군과 부딪히게 만든다.',
    },
    {
        id: 41, name: '분신술사', category: '특수이동형',
        move: '전(全)', force: 2, mass: 2, agility: 4, ap: 2,
        traits: ["특수: 이동 시 이전 위치에 잔상 생성 (1턴)"],
        desc: '이동하면서 잔상으로 후방을 잠시 막을 수 있다. 위치 교란의 달인.',
    },
    {
        id: 42, name: '반사경', category: '특수이동형',
        move: '고정(■)', force: 1, mass: 5, agility: 1, ap: 2,
        traits: ["고정대", "특수: 충돌 방향을 90도 꺾어 반사"],
        desc: '밀려오는 기물을 옆 방향으로 튕겨낸다. 연쇄 충돌 설계의 핵심 기물.',
    },
    {
        id: 43, name: '도약폭탄', category: '특수이동형',
        move: '도약(♞)', force: 3, mass: 1, agility: 3, ap: 2,
        traits: ["붕괴(4)", "폭사", "무른"],
        desc: 'L자로 적진에 침투한 뒤 4턴 후 폭사. 죽어도 지휘관 피해 없음.',
    },
    {
        id: 44, name: '탐욕기사', category: '복합형',
        move: '전(全)', force: 3, mass: 2, agility: 3, ap: 2,
        traits: ["양날의검", "특수: 적 이탈시킬 때마다 힘+1 (최대5)"],
        desc: '킬을 먹을수록 강해지지만 죽으면 지휘관 -2. 성장과 위험의 균형.',
    },
    {
        id: 45, name: '분노체', category: '복합형',
        move: '주(主)', force: 2, mass: 3, agility: 2, ap: 1,
        traits: ["양날의검", "특수: 인접 아군 사망 시 힘+2 (최대5)"],
        desc: '동료의 죽음에서 힘을 얻는다. 희생 전략과 조합하면 폭발적인 성장.',
    },
    {
        id: 46, name: '거울기사', category: '복합형',
        move: '주(主)', force: 1, mass: 1, agility: 3, ap: 2,
        traits: ["특수: 인접 적 스탯 복사 (힘·질량·민첩)"],
        desc: '강적 옆에 붙이면 같은 스탯을 갖게 된다. 상황 대응의 최강 기물.',
    },
    {
        id: 47, name: '영매', category: '복합형',
        move: '사(斜)', force: 1, mass: 2, agility: 3, ap: 3,
        traits: ["특수: 이번 런에서 죽은 아군 1기물 소환 (1회)"],
        desc: 'AP 소모가 크지만 잃었던 기물을 되살릴 수 있다. 런 회복의 열쇠.',
    },
    {
        id: 48, name: '왕의 기사', category: '복합형',
        move: '전(全)', force: 3, mass: 3, agility: 3, ap: 3,
        traits: ["고취", "방벽", "양날의검"],
        desc: '인접 아군 힘+1, 질량+1을 동시에 제공하는 최강 지원. 죽으면 지휘관 -2.',
    },
    {
        id: 49, name: '계약병', category: '복합형',
        move: '돌진(⇒)', force: 4, mass: 2, agility: 4, ap: 2,
        traits: ["순교자", "양날의검"],
        desc: '사망 시 지휘관 +1이지만 양날의검으로 -2도. 순합산 -1. 강력하지만 잃으면 손해.',
    },
    {
        id: 50, name: '혼돈의 파편', category: '복합형',
        move: '랜덤(?)', force: 0, mass: 0, agility: 0, ap: 1,
        traits: ["무른", "소환(1): 매 턴 자신 복제 생성 (복제본 붕괴(2))", "특수: 매 턴 모든 스탯 랜덤"],
        desc: '매 턴 모든 스탯과 이동이 랜덤. 죽어도 지휘관 피해 없음. 카오스 그 자체.',
    },
];
export const getPieceById = (id) => PIECES.find(p => p.id === id);
export const getPiecesByCategory = (category) => PIECES.filter(p => p.category === category);
export const MOVE_TYPES = ["주(主)", "사(斜)", "전(全)", "십자(十)", "사선(╲)", "도약(♞)", "전진(↑)", "역주(↓)", "돌진(⇒)", "고정(■)", "랜덤(?)"];
export const TRAIT_DEFINITIONS = [
    {
        "id": "양날의검",
        "category": "사망",
        "effect": "사망 시 지휘관 HP -2 (기본 -1 대신)"
    },
    {
        "id": "무른",
        "category": "사망",
        "effect": "사망 시 지휘관 HP 피해 없음"
    },
    {
        "id": "순교자",
        "category": "사망",
        "effect": "사망 시 지휘관 HP +1 (치유)"
    },
    {
        "id": "폭사",
        "category": "사망",
        "effect": "액티브: AP 소모로 자폭. 인접 모든 기물 1칸씩 밀어냄 후 사망",
        "active": true
    },
    {
        "id": "관통",
        "category": "충돌",
        "effect": "충돌 시 연쇄 감쇠 없이 원래 힘으로 뒤의 기물도 밀어냄"
    },
    {
        "id": "반탄",
        "category": "충돌",
        "effect": "밀려날 때 공격자도 반대 방향으로 같은 칸수 밀려남"
    },
    {
        "id": "고정대",
        "category": "충돌",
        "effect": "어떤 힘에도 밀려나지 않음 (최소 1칸 규칙 무시)"
    },
    {
        "id": "가시",
        "category": "충돌",
        "effect": "자신을 밀어낸 기물에게 역충돌 피해"
    },
    {
        "id": "고취",
        "category": "버프",
        "effect": "인접 아군 힘 +1"
    },
    {
        "id": "방벽",
        "category": "버프",
        "effect": "인접 아군 질량 +1"
    },
    {
        "id": "가속",
        "category": "버프",
        "effect": "인접 아군 민첩 +2"
    },
    {
        "id": "교란",
        "category": "디버프",
        "effect": "인접 적 민첩 -2"
    },
    {
        "id": "약화",
        "category": "디버프",
        "effect": "인접 적 힘 -1"
    },
    {
        "id": "각성(N)",
        "category": "카운트다운",
        "effect": "N턴 후 스탯 및 이동 방식 강화 또는 변형"
    },
    {
        "id": "붕괴(N)",
        "category": "카운트다운",
        "effect": "N턴 후 폭사 후 사망"
    },
    {
        "id": "소환(N)",
        "category": "카운트다운",
        "effect": "N턴마다 인접 빈 칸에 기물 생성"
    },
    {
        "id": "봉인(N)",
        "category": "카운트다운",
        "effect": "N턴간 이동 불가 상태"
    },
    {
        "id": "도발",
        "category": "기타",
        "effect": "적 AI가 다른 기물보다 우선적으로 이 기물을 타겟"
    },
    {
        "id": "은신",
        "category": "기타",
        "effect": "적 AI의 행동 계획에서 이 기물을 인식하지 못함"
    }
];
