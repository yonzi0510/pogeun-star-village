'use client';

// 오늘 받은 칭찬은 마을에 들어오면 잠깐 떠올랐다가 스스로 사라지는 알림으로 보여준다.
// (탭을 누르지 않아도 되고, 원하면 닫기 버튼으로 바로 치울 수도 있다.)
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
