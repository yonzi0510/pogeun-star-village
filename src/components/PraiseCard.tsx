'use client';

// 오늘 받은 칭찬을 마을 화면에서 가장 먼저 보이게(마을 다음 우선순위로) 보여주는 카드.
// 앨범 탭의 고정 칭찬 기록과 같은 문구를 재사용해 데이터 소스를 늘리지 않는다.
export function PraiseCard() {
  return (
    <div className="side-panel">
      <div className="praise-card">
        <span>💌</span>
        <div>
          <small>정리 칭찬</small>
          <p>스스로 장난감을 정리해서 정말 멋졌어!</p>
        </div>
        <strong>+3</strong>
      </div>
    </div>
  );
}
