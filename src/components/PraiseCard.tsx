'use client';

import { PRAISE_TIERS, type PraiseEvent } from '../game/family';

// 부모가 보낸 칭찬이 도착하면 잠깐 떠올랐다가 스스로 사라지는 편지로 보여준다.
// (탭을 누르지 않아도 되고, 원하면 닫기 버튼으로 바로 치울 수도 있다.)
export function PraiseCard({ praise, onClose }: { praise: PraiseEvent; onClose: () => void }) {
  const tier = PRAISE_TIERS[praise.tier];
  return (
    <div className="praise-card">
      <span>{tier.emoji}</span>
      <div>
        <small>{tier.label}</small>
        <p>{praise.message}</p>
      </div>
      <strong>+{praise.tokens}</strong>
      <button className="praise-close" onClick={onClose} aria-label="칭찬 편지 닫기">×</button>
    </div>
  );
}
