// 마을 성장 단계와 "오늘의 마을 생활" 활동 데이터.
// 이 파일은 순수 데이터/함수만 담고, 실제 상태(useState)는 app/page.tsx에 남긴다.

export type VillageStage = {
  id: string;
  name: string;
  threshold: number;
  unlockedResidents: string[];
  unlockedBuildings: Array<'house' | 'garden' | 'post'>;
};

// 기획서의 5단계 중 처음 세 단계만 구현한다.
export const VILLAGE_STAGES: VillageStage[] = [
  {
    id: 'small-hill',
    name: '작은 언덕',
    threshold: 0,
    unlockedResidents: ['모모몽'],
    unlockedBuildings: ['house'],
  },
  {
    id: 'cozy-neighbors',
    name: '포근한 이웃',
    threshold: 500,
    unlockedResidents: ['모모몽', '포포', '두리콩'],
    unlockedBuildings: ['house', 'garden', 'post'],
  },
  {
    id: 'starlight-village',
    name: '별빛 마을',
    threshold: 1200,
    unlockedResidents: ['모모몽', '포포', '두리콩', '루루별'],
    unlockedBuildings: ['house', 'garden', 'post'],
  },
];

export function getVillageStage(starlight: number): VillageStage {
  let stage = VILLAGE_STAGES[0]!;
  for (const candidate of VILLAGE_STAGES) {
    if (starlight >= candidate.threshold) stage = candidate;
  }
  return stage;
}

export function getNextStage(stage: VillageStage): VillageStage | null {
  const index = VILLAGE_STAGES.findIndex((entry) => entry.id === stage.id);
  return VILLAGE_STAGES[index + 1] ?? null;
}

export type VillageActivityCategory = 'manner' | 'chore';

export type VillageActivity = {
  id: string;
  category: VillageActivityCategory;
  name: string;
  emoji: string;
  tokens: number;
  starlight: number;
  cooldownHours: number;
};

// 부모의 칭찬 스티커 외에, 마을 생활 속 매너 연습과 마을일 돕기로도 토큰·별빛을 얻는다.
// 하루 한 번(cooldownHours)만 인정해 무한 반복으로 보상을 모으는 것을 막는다.
export const VILLAGE_ACTIVITIES: VillageActivity[] = [
  { id: 'greet-neighbor', category: 'manner', name: '이웃과 인사하기', emoji: '👋', tokens: 1, starlight: 10, cooldownHours: 20 },
  { id: 'say-thanks', category: 'manner', name: '감사 인사하기', emoji: '🙏', tokens: 1, starlight: 10, cooldownHours: 20 },
  { id: 'keep-promise', category: 'manner', name: '약속 지키기', emoji: '🤝', tokens: 1, starlight: 10, cooldownHours: 20 },
  { id: 'share-turn', category: 'manner', name: '차례 양보하기', emoji: '🔄', tokens: 1, starlight: 10, cooldownHours: 20 },
  { id: 'check-mailbox', category: 'chore', name: '우체통 확인하기', emoji: '📬', tokens: 1, starlight: 10, cooldownHours: 20 },
  { id: 'tidy-bench', category: 'chore', name: '광장 벤치 정리', emoji: '🪑', tokens: 1, starlight: 10, cooldownHours: 20 },
  { id: 'polish-lamp', category: 'chore', name: '가로등 닦기', emoji: '🏮', tokens: 1, starlight: 10, cooldownHours: 20 },
  { id: 'pull-weeds', category: 'chore', name: '꽃밭 잡초 뽑기', emoji: '🌱', tokens: 1, starlight: 10, cooldownHours: 20 },
];

// 한글 받침 유무에 따라 "을/를" 목적격 조사를 고른다 (예: "포포를", "모모몽을").
export function withObjectParticle(name: string): string {
  const lastChar = name.charCodeAt(name.length - 1) - 0xac00;
  const hasBatchim = lastChar >= 0 && lastChar < 11172 && lastChar % 28 !== 0;
  return `${name}${hasBatchim ? '을' : '를'}`;
}

export function isActivityReady(log: Record<string, string>, activityId: string, now: number = Date.now()): boolean {
  const activity = VILLAGE_ACTIVITIES.find((entry) => entry.id === activityId);
  if (!activity) return false;
  const lastCompletedAt = log[activityId];
  if (!lastCompletedAt) return true;
  const elapsedHours = (now - new Date(lastCompletedAt).getTime()) / (1000 * 60 * 60);
  return elapsedHours >= activity.cooldownHours;
}
