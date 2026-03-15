// src/data/events.ts
// VANGUARD PUSH — 이벤트 데이터 (15종)
// 이 파일은 완성본입니다.
export const EVENTS = [
    {
        id: 1, type: '기물',
        name: '버려진 병기고',
        desc: '폐허가 된 병기고에서 오래된 기물 하나를 발견했다. 먼지가 쌓여 있지만 아직 쓸 만해 보인다.',
        choices: [
            {
                "label": "수령한다",
                "risk": "low",
                "effect": "랜덤 기물 1개 즉시 획득 (등급 랜덤, 고급 이하)"
            },
            {
                "label": "강화해서 수령한다",
                "risk": "medium",
                "effect": "지휘관 HP -2. 랜덤 기물 1개 획득 (희귀 이하)"
            },
            {
                "label": "그냥 지나친다",
                "risk": "none",
                "effect": "아무 일도 일어나지 않는다"
            }
        ],
    },
    {
        id: 2, type: '기물',
        name: '고대 의식',
        desc: '기묘한 제단 앞에 선다. 기물 하나를 바치면 강력한 힘을 얻을 수 있다고 한다.',
        choices: [
            {
                "label": "기물을 바친다",
                "risk": "high",
                "effect": "보유 기물 1개 선택 제거 → 전설 기물 1개 즉시 픽"
            },
            {
                "label": "외면한다",
                "risk": "none",
                "effect": "아무 일도 일어나지 않는다"
            }
        ],
    },
    {
        id: 3, type: '기물',
        name: '돌연변이 실험체',
        desc: '정체불명의 실험체가 도움을 청한다. 아군으로 편입하면 예측 불가한 능력을 발휘할 수도 있다.',
        choices: [
            {
                "label": "편입한다",
                "risk": "medium",
                "effect": "'혼돈의 파편' 기물 즉시 획득. 지휘관 HP -1"
            },
            {
                "label": "거절한다",
                "risk": "none",
                "effect": "아무 일도 일어나지 않는다"
            }
        ],
    },
    {
        id: 4, type: '진형',
        name: '잊혀진 전술서',
        desc: '고대 전략가의 전술서를 발견했다. 한 번도 본 적 없는 진형 배치도가 그려져 있다.',
        choices: [
            {
                "label": "해독한다",
                "risk": "low",
                "effect": "랜덤 진형 카드 1장 즉시 획득 (고급 이하)"
            },
            {
                "label": "완전히 해독한다",
                "risk": "medium",
                "effect": "지휘관 HP -3. 랜덤 진형 카드 1장 획득 (희귀 이하)"
            }
        ],
    },
    {
        id: 5, type: '진형',
        name: '진형 충돌',
        desc: '두 개의 진형 카드가 동시에 발견됐다. 하나만 가져갈 수 있다.',
        choices: [
            {
                "label": "공격형 진형",
                "risk": "none",
                "effect": "랜덤 공격 강화 계열 진형 카드 1장 획득"
            },
            {
                "label": "방어형 진형",
                "risk": "none",
                "effect": "랜덤 방어 강화 계열 진형 카드 1장 획득"
            }
        ],
    },
    {
        id: 6, type: '지휘관',
        name: '전장의 치유사',
        desc: '부상당한 치유사를 발견했다. 그는 대가를 받고 지휘관의 상처를 치료해줄 수 있다고 한다.',
        choices: [
            {
                "label": "기물 1개를 대가로 치료받는다",
                "risk": "high",
                "effect": "보유 기물 중 랜덤 1개 제거 → 지휘관 HP +5"
            },
            {
                "label": "소량의 대가로 치료받는다",
                "risk": "low",
                "effect": "지휘관 HP +2"
            },
            {
                "label": "거절한다",
                "risk": "none",
                "effect": "아무 일도 일어나지 않는다"
            }
        ],
    },
    {
        id: 7, type: '지휘관',
        name: '악마의 계약',
        desc: '정체불명의 존재가 계약을 제안한다. 지금 당장의 힘을 주는 대신 나중에 큰 대가를 치러야 한다.',
        choices: [
            {
                "label": "계약한다",
                "risk": "extreme",
                "effect": "전설 기물 1개 즉시 획득 + 지휘관 최대 HP -5 (영구)"
            },
            {
                "label": "거절한다",
                "risk": "none",
                "effect": "아무 일도 일어나지 않는다"
            }
        ],
    },
    {
        id: 8, type: '지휘관',
        name: '군중의 환호',
        desc: '아군 병사들의 사기가 최고조에 달했다. 지휘관의 존재 자체가 힘이 되는 순간.',
        choices: [
            {
                "label": "연설한다",
                "risk": "none",
                "effect": "지휘관 HP +3. 다음 층 시작 시 모든 아군 민첩 +1"
            }
        ],
    },
    {
        id: 9, type: '저주',
        name: '저주받은 유물',
        desc: '강력한 힘이 느껴지는 유물. 하지만 뭔가 불길한 기운이 서려 있다.',
        choices: [
            {
                "label": "획득한다",
                "risk": "high",
                "effect": "희귀 기물 1개 획득 + 보유 기물 중 랜덤 1개에 '양날의검' 특성 추가 (영구)"
            },
            {
                "label": "파괴한다",
                "risk": "none",
                "effect": "아무 일도 일어나지 않는다. 뭔가 아쉽다"
            }
        ],
    },
    {
        id: 10, type: '저주',
        name: '안개 속의 전장',
        desc: '짙은 안개가 전장을 뒤덮었다. 다음 전투에서 적의 행동 의도가 공개되지 않는다.',
        choices: [
            {
                "label": "안개 속으로 나아간다",
                "risk": "high",
                "effect": "다음 전투 적 행동 의도 비공개. 대신 클리어 시 보상 +1 추가"
            },
            {
                "label": "우회한다",
                "risk": "none",
                "effect": "다음 층으로 진행. 보상 없음"
            }
        ],
    },
    {
        id: 11, type: '저주',
        name: '전염병',
        desc: '알 수 없는 병이 아군 기물들에게 퍼졌다. 이번 층이 끝날 때까지 영향이 지속된다.',
        choices: [
            {
                "label": "버텨낸다",
                "risk": "high",
                "effect": "이번 층 모든 아군 민첩 -2. 클리어 시 전설 기물 픽 기회"
            },
            {
                "label": "치료에 자원을 쏟는다",
                "risk": "medium",
                "effect": "지휘관 HP -3. 전염병 효과 없음"
            }
        ],
    },
    {
        id: 12, type: '거래',
        name: '용병 시장',
        desc: '실력 있는 용병들이 모여 있다. 대가를 치르면 즉시 전력에 편입할 수 있다.',
        choices: [
            {
                "label": "고급 용병을 고용한다",
                "risk": "low",
                "effect": "지휘관 HP -2 → 고급 기물 1개 즉시 획득"
            },
            {
                "label": "희귀 용병을 고용한다",
                "risk": "medium",
                "effect": "지휘관 HP -4 → 희귀 기물 1개 즉시 획득"
            },
            {
                "label": "고용하지 않는다",
                "risk": "none",
                "effect": "아무 일도 일어나지 않는다"
            }
        ],
    },
    {
        id: 13, type: '거래',
        name: '진형 연구소',
        desc: '전술 연구가가 진형 카드 교환을 제안한다. 가진 것을 내어주면 새로운 전술을 전수해준다.',
        choices: [
            {
                "label": "진형 카드를 교환한다",
                "risk": "medium",
                "effect": "보유 진형 카드 1장 반납 → 상위 등급 진형 카드 1장 획득"
            },
            {
                "label": "거절한다",
                "risk": "none",
                "effect": "아무 일도 일어나지 않는다"
            }
        ],
    },
    {
        id: 14, type: '거래',
        name: '기물 강화사',
        desc: '전문 강화사가 기물의 잠재력을 끌어낼 수 있다고 한다. 단, 부작용이 생길 수도 있다.',
        choices: [
            {
                "label": "강화를 의뢰한다",
                "risk": "medium",
                "effect": "기물 1개 선택 → 힘·질량·민첩 중 랜덤 2개 +2. 단 나머지 1개 -1"
            },
            {
                "label": "안전한 강화를 의뢰한다",
                "risk": "low",
                "effect": "기물 1개 선택 → 선택한 스탯 1개 +1"
            }
        ],
    },
    {
        id: 15, type: '거래',
        name: '비밀 상인',
        desc: '정체를 숨긴 상인이 특별한 물건을 보여준다. 정가보다 훨씬 비싸지만 어디서도 볼 수 없는 물건이다.',
        choices: [
            {
                "label": "구매한다",
                "risk": "high",
                "effect": "지휘관 HP -5 → 전설 기물 또는 전설 진형 카드 중 랜덤 1개"
            },
            {
                "label": "거절한다",
                "risk": "none",
                "effect": "아무 일도 일어나지 않는다"
            }
        ],
    },
];
export const getRandomEvent = () => EVENTS[Math.floor(Math.random() * EVENTS.length)];
export const getEventsByType = (type) => EVENTS.filter(e => e.type === type);
