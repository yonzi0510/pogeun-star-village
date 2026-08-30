'use client';

type Props = {
  tokens: number;
  starlight: number;
  timeLabel: string;
  isVillageTab: boolean;
};

export function GameHeader({ tokens, starlight, timeLabel, isVillageTab }: Props) {
  return (
    <header className={`topbar ${isVillageTab ? 'village-topbar' : ''}`}>
      <div>
        <p className="eyebrow">칭찬이 별빛이 되는 곳</p>
        <h1>포근별 마을 <span>✨</span></h1>
      </div>
      <div className="stats" aria-label="게임 재화">
        <div className="stat token-stat">
          <img src="/praise-token-3d.png" alt="" />
          <p>칭찬 토큰<strong>{tokens}</strong></p>
        </div>
        <div className="stat">
          <span>💫</span>
          <p>별빛<strong>{starlight}</strong></p>
        </div>
        <div className="stat clock">
          <span>🌤️</span>
          <p>포근한 아침<strong>{timeLabel}</strong></p>
        </div>
      </div>
    </header>
  );
}
