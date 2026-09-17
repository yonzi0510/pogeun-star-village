// 부모 앱과 아이 앱이 함께 쓰는 가족 코드/칭찬 등급 정의.
// 헷갈리기 쉬운 0/O, 1/I는 코드에서 뺀다.
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateFamilyCode(): string {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function normalizeFamilyCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export type PraiseTier = 'small' | 'warm' | 'best';

export const PRAISE_TIERS: Record<PraiseTier, { label: string; emoji: string; tokens: number; starlight: number }> = {
  small: { label: '작은 칭찬', emoji: '🌱', tokens: 1, starlight: 10 },
  warm: { label: '다정한 칭찬', emoji: '💐', tokens: 3, starlight: 30 },
  best: { label: '최고의 칭찬', emoji: '🌟', tokens: 5, starlight: 50 },
};

export function isPraiseTier(value: unknown): value is PraiseTier {
  return value === 'small' || value === 'warm' || value === 'best';
}

export type PraiseEvent = {
  id: number;
  message: string;
  tier: PraiseTier;
  tokens: number;
  starlight: number;
  createdAt: string;
};
