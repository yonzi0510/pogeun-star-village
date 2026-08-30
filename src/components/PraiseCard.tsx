'use client';

// 오늘 받은 칭찬은 항상 큰 카드로 떠 있지 않고, 우편함 아이콘(PraiseMailToggle)을 눌렀을 때만
// 떠오르는 팝업으로 보여준다 — 이미 있던 .praise-mail-toggle/.praise-close/.praise-card
// CSS와 showPraise 상태를 그대로 사용한다.
export function PraiseMailToggle({ onClick }: { onClick: () => void }) {
  return (
    <button className="praise-mail-toggle" onClick={onClick} aria-label="오늘 받은 칭찬 편지 열기">
      <i aria-hidden="true" />
      <span>오늘의 칭찬 편지</span>
      <strong>1</strong>
    </button>
  );
}

export function PraiseCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="praise-card">
      <span>💌</span>
      <div>
        <small>정리 칭찬</small>
        <p>스스로 장난감을 정리해서 정말 멋졌어!</p>
      </div>
      <strong>+3</strong>
      <button className="praise-close" onClick={onClose} aria-label="칭찬 편지 닫기">×</button>
    </div>
  );
}
