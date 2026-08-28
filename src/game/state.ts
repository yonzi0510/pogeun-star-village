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

export type GameState = {
  tokenBalance: number;
  starlight: number;
  praiseEvents: PraiseEvent[];
  transactions: TokenTransaction[];
  ownedItemIds: string[];
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

export type GameAction =
  | { type: 'AWARD_PRAISE'; event: PraiseEvent }
  | { type: 'BUY_ITEM'; itemId: string; itemName: string; cost: number; transactionId: string; createdAt: string };

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

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'AWARD_PRAISE':
      return awardPraise(state, action.event);
    case 'BUY_ITEM':
      return buyItem(state, action);
    default:
      return state;
  }
}
