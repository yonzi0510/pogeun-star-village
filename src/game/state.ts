export type PraiseCategory = '노력' | '배려' | '정리' | '약속' | '창의성' | '감정 표현' | '협동';

export type PraiseEvent = {
  id: string;
  message: string;
  category: PraiseCategory;
  tokens: number;
  createdAt: string;
};

export type TokenTransaction = {
  id: string;
  kind: 'earn' | 'spend';
  amount: number;
  reason: string;
  createdAt: string;
};

export type ItemPlacement = {
  itemId: string;
  slotId: string;
};

export type EtiquetteActivity = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tokens: number;
  cooldownHours: number;
};

export type GameState = {
  tokenBalance: number;
  starlight: number;
  praiseEvents: PraiseEvent[];
  transactions: TokenTransaction[];
  ownedItemIds: string[];
  placements: ItemPlacement[];
  etiquetteLog: Record<string, string>;
};

export type VillageStage = {
  id: string;
  name: string;
  threshold: number;
  unlockedResidents: string[];
  unlockedBuildings: string[];
};

export type VillageProgress = {
  stageIndex: number;
  stage: VillageStage;
  nextStage: VillageStage | null;
  nextThreshold: number | null;
  progressToNext: number;
};

// MVP는 기획서의 5단계 중 처음 세 단계만 구현합니다.
export const VILLAGE_STAGES: VillageStage[] = [
  {
    id: 'small-hill',
    name: '작은 언덕',
    threshold: 0,
    unlockedResidents: ['모모몽'],
    unlockedBuildings: ['모모몽의 집'],
  },
  {
    id: 'cozy-neighbors',
    name: '포근한 이웃',
    threshold: 500,
    unlockedResidents: ['모모몽', '포포', '두리콩'],
    unlockedBuildings: ['모모몽의 집', '구름정원', '별빛우체국'],
  },
  {
    id: 'starlight-village',
    name: '별빛 마을',
    threshold: 1200,
    unlockedResidents: ['모모몽', '포포', '두리콩', '루루별'],
    unlockedBuildings: ['모모몽의 집', '구름정원', '별빛우체국'],
  },
];

export function getVillageProgress(starlight: number): VillageProgress {
  let stageIndex = 0;
  for (let i = 0; i < VILLAGE_STAGES.length; i += 1) {
    if (starlight >= VILLAGE_STAGES[i]!.threshold) {
      stageIndex = i;
    }
  }

  const stage = VILLAGE_STAGES[stageIndex]!;
  const nextStage = VILLAGE_STAGES[stageIndex + 1] ?? null;
  const nextThreshold = nextStage ? nextStage.threshold : null;
  const progressToNext = nextStage
    ? Math.min(1, Math.max(0, (starlight - stage.threshold) / (nextStage.threshold - stage.threshold)))
    : 1;

  return { stageIndex, stage, nextStage, nextThreshold, progressToNext };
}

// 부모의 칭찬 스티커 외에, 마을 생활 속 사회 에티켓을 연습하면 얻는 토큰 활동입니다.
// 하루 한 번(cooldownHours)만 인정해 무한 반복으로 토큰을 모으는 것을 막습니다.
export const ETIQUETTE_ACTIVITIES: EtiquetteActivity[] = [
  {
    id: 'greet-neighbor',
    name: '이웃과 인사하기',
    emoji: '👋',
    description: '마을에서 만난 주민에게 먼저 반갑게 인사해요.',
    tokens: 1,
    cooldownHours: 20,
  },
  {
    id: 'say-thanks',
    name: '감사 인사하기',
    emoji: '🙏',
    description: '도움을 준 주민에게 고맙다고 말해요.',
    tokens: 1,
    cooldownHours: 20,
  },
  {
    id: 'keep-promise',
    name: '약속 지키기',
    emoji: '🤝',
    description: '오늘 하기로 한 약속을 잘 지켰는지 스스로 점검해요.',
    tokens: 1,
    cooldownHours: 20,
  },
  {
    id: 'share-turn',
    name: '차례 양보하기',
    emoji: '🔄',
    description: '함께하는 놀이에서 차례를 양보하는 연습을 해요.',
    tokens: 1,
    cooldownHours: 20,
  },
];

export type GameAction =
  | { type: 'AWARD_PRAISE'; event: PraiseEvent }
  | { type: 'BUY_ITEM'; itemId: string; itemName: string; cost: number; transactionId: string; createdAt: string }
  | { type: 'PLACE_ITEM'; itemId: string; slotId: string }
  | { type: 'UNPLACE_ITEM'; slotId: string }
  | { type: 'COMPLETE_ETIQUETTE_ACTIVITY'; activityId: string; transactionId: string; createdAt: string };

export const initialGameState: GameState = {
  tokenBalance: 24,
  starlight: 320,
  praiseEvents: [
    {
      id: 'praise-seed-1',
      message: '스스로 장난감을 정리해서 정말 멋졌어!',
      category: '정리',
      tokens: 3,
      createdAt: '2026-08-25T09:00:00.000Z',
    },
  ],
  transactions: [
    {
      id: 'token-seed-1',
      kind: 'earn',
      amount: 3,
      reason: '정리 칭찬',
      createdAt: '2026-08-25T09:00:00.000Z',
    },
  ],
  ownedItemIds: [],
  placements: [],
  etiquetteLog: {},
};

function isPositiveInteger(value: number) {
  return Number.isInteger(value) && value > 0;
}

export function awardPraise(state: GameState, event: PraiseEvent): GameState {
  if (!isPositiveInteger(event.tokens) || event.tokens > 5) {
    throw new Error('칭찬 토큰은 1~5 사이의 정수여야 합니다.');
  }
  if (state.praiseEvents.some((item) => item.id === event.id)) {
    return state;
  }

  return {
    ...state,
    tokenBalance: state.tokenBalance + event.tokens,
    starlight: state.starlight + event.tokens * 10,
    praiseEvents: [event, ...state.praiseEvents],
    transactions: [
      {
        id: `token-${event.id}`,
        kind: 'earn',
        amount: event.tokens,
        reason: `${event.category} 칭찬`,
        createdAt: event.createdAt,
      },
      ...state.transactions,
    ],
  };
}

export function buyItem(
  state: GameState,
  input: { itemId: string; itemName: string; cost: number; transactionId: string; createdAt: string },
): GameState {
  if (!isPositiveInteger(input.cost)) {
    throw new Error('아이템 가격은 양의 정수여야 합니다.');
  }
  if (state.ownedItemIds.includes(input.itemId)) {
    return state;
  }
  if (state.tokenBalance < input.cost) {
    throw new Error('칭찬 토큰이 부족합니다.');
  }

  return {
    ...state,
    tokenBalance: state.tokenBalance - input.cost,
    ownedItemIds: [...state.ownedItemIds, input.itemId],
    transactions: [
      {
        id: input.transactionId,
        kind: 'spend',
        amount: input.cost,
        reason: `${input.itemName} 꾸미기`,
        createdAt: input.createdAt,
      },
      ...state.transactions,
    ],
  };
}

export function placeItem(state: GameState, input: { itemId: string; slotId: string }): GameState {
  if (!state.ownedItemIds.includes(input.itemId)) {
    throw new Error('먼저 꾸미기에서 아이템을 구매해야 해요.');
  }
  if (state.placements.some((placement) => placement.slotId === input.slotId)) {
    throw new Error('이미 다른 아이템이 놓여 있어요.');
  }

  const withoutPreviousSpot = state.placements.filter((placement) => placement.itemId !== input.itemId);

  return {
    ...state,
    placements: [...withoutPreviousSpot, { itemId: input.itemId, slotId: input.slotId }],
  };
}

export function unplaceItem(state: GameState, input: { slotId: string }): GameState {
  return {
    ...state,
    placements: state.placements.filter((placement) => placement.slotId !== input.slotId),
  };
}

export function isEtiquetteActivityReady(
  state: GameState,
  activityId: string,
  now: Date = new Date(),
): boolean {
  const activity = ETIQUETTE_ACTIVITIES.find((item) => item.id === activityId);
  if (!activity) {
    return false;
  }

  const lastCompletedAt = state.etiquetteLog[activityId];
  if (!lastCompletedAt) {
    return true;
  }

  const elapsedHours = (now.getTime() - new Date(lastCompletedAt).getTime()) / (1000 * 60 * 60);
  return elapsedHours >= activity.cooldownHours;
}

export function completeEtiquetteActivity(
  state: GameState,
  input: { activityId: string; transactionId: string; createdAt: string },
): GameState {
  const activity = ETIQUETTE_ACTIVITIES.find((item) => item.id === input.activityId);
  if (!activity) {
    throw new Error('알 수 없는 마을 생활 활동이에요.');
  }
  if (!isEtiquetteActivityReady(state, input.activityId, new Date(input.createdAt))) {
    throw new Error('이 활동은 오늘 이미 실천했어요. 내일 다시 해봐요!');
  }

  return {
    ...state,
    tokenBalance: state.tokenBalance + activity.tokens,
    starlight: state.starlight + activity.tokens * 10,
    etiquetteLog: { ...state.etiquetteLog, [input.activityId]: input.createdAt },
    transactions: [
      {
        id: input.transactionId,
        kind: 'earn',
        amount: activity.tokens,
        reason: `${activity.name} 실천`,
        createdAt: input.createdAt,
      },
      ...state.transactions,
    ],
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'AWARD_PRAISE':
      return awardPraise(state, action.event);
    case 'BUY_ITEM':
      return buyItem(state, action);
    case 'PLACE_ITEM':
      return placeItem(state, action);
    case 'UNPLACE_ITEM':
      return unplaceItem(state, action);
    case 'COMPLETE_ETIQUETTE_ACTIVITY':
      return completeEtiquetteActivity(state, action);
    default:
      return state;
  }
}
