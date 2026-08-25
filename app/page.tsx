'use client';

import { useEffect, useState } from 'react';

type Tab = '마을' | '친구' | '꾸미기' | '앨범';

const residents = [
  { name: '포포', sprite: '/popo.png', portrait: 'p1', color: 'mint', activity: '구름정원에 물 주는 중' },
  { name: '모모몽', sprite: '/momomong.png', portrait: 'p0', color: 'peach', activity: '광장에서 산책하는 중' },
  { name: '두리콩', sprite: '/durikong.png', portrait: 'p2', color: 'butter', activity: '칭찬 편지를 배달하는 중' },
  { name: '루루별', sprite: '/lurustar.png', portrait: 'p3', color: 'lavender', activity: '별빛을 찾으러 걷는 중' },
];

const items = [
  { id: 'swing', name: '구름 그네', emoji: '☁️', cost: 10 },
  { id: 'lamp', name: '별빛 램프', emoji: '🌟', cost: 12 },
  { id: 'sofa', name: '리본 소파', emoji: '🎀', cost: 15 },
  { id: 'table', name: '꽃잎 탁자', emoji: '🌼', cost: 8 },
];

const tabs: { name: Tab; emoji: string }[] = [
  { name: '마을', emoji: '🏡' }, { name: '친구', emoji: '🐰' },
  { name: '꾸미기', emoji: '🖌️' }, { name: '앨범', emoji: '📖' },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('마을');
  const [selected, setSelected] = useState('모모몽');
  const [tokens, setTokens] = useState(24);
  const [owned, setOwned] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [positions, setPositions] = useState([{ x: 34, y: 65 }, { x: 45, y: 72 }, { x: 57, y: 64 }, { x: 68, y: 73 }]);
  const resident = residents.find((entry) => entry.name === selected) ?? residents[1];

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setPositions((current) => current.map((position) => ({
      x: Math.max(22, Math.min(76, position.x + (Math.random() - .5) * 15)),
      y: Math.max(52, Math.min(79, position.y + (Math.random() - .5) * 10)),
    }))), 2200);
    return () => window.clearInterval(timer);
  }, []);

  function selectTab(nextTab: Tab) {
    setTab(nextTab); setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buy(item: (typeof items)[number]) {
    if (owned.includes(item.id)) return setNotice(`${item.name}은 이미 우리 마을에 있어요!`);
    if (tokens < item.cost) return setNotice(`토큰이 부족해요. ${item.cost}개가 필요해요.`);
    setTokens((value) => value - item.cost);
    setOwned((value) => [...value, item.id]);
    setNotice(`${item.name}을 마을에 놓았어요!`);
  }

  return (
    <main className="game-shell">
      <div className="sky-decor" aria-hidden="true"><span>☁️</span><span>✨</span><span>☁️</span></div>
      <div className="game-frame">
        <header className="topbar">
          <div><p className="eyebrow">칭찬이 별빛이 되는 곳</p><h1>포근별 마을 <span>✨</span></h1></div>
          <div className="stats" aria-label="게임 재화">
            <div className="stat"><span>⭐</span><p>칭찬 토큰<strong>{tokens}</strong></p></div>
            <div className="stat"><span>💫</span><p>별빛<strong>320</strong></p></div>
          </div>
        </header>

        {tab === '마을' && <section className="home-grid">
          <div className="village-card illustrated">
            <img src="/village-map.png" alt="산책할 수 있는 포근별 마을 광장" />
            <div className="village-heading"><span className="stage-pill">작은 언덕 · 1단계</span><h2>우리 마을이 자라고 있어요!</h2></div>
            <button className="map-hit house-hit" aria-label="모모몽의 집" onClick={() => setNotice('모모몽의 집에 별빛이 반짝여요!')} />
            <button className="map-hit garden-hit" aria-label="구름정원" onClick={() => setNotice('포포가 구름정원에 물을 주고 있어요!')} />
            <button className="map-hit post-hit" aria-label="별빛우체국" onClick={() => setNotice('두리콩이 새 편지를 가져왔어요!')} />
            <div className="moving-layer">{residents.map((entry, index) => <button key={entry.name} className={`moving-character ${selected === entry.name ? 'selected' : ''}`} style={{ left: `${positions[index]?.x ?? 50}%`, top: `${positions[index]?.y ?? 65}%` }} onClick={() => { setSelected(entry.name); setNotice(`${entry.name}: ${entry.activity}`); }} aria-label={`${entry.name}에게 말 걸기`}><img src={entry.sprite} alt="" /><span>{entry.name}</span></button>)}</div>
            <div className="speech"><strong>{resident?.name}</strong><span>{resident?.activity}</span></div>
          </div>
          <aside className="side-panel">
            <div className="praise-card"><span>💌</span><div><small>오늘 받은 따뜻한 칭찬</small><p>“스스로 장난감을 정리해서 정말 멋졌어!”</p></div><strong>+3</strong></div>
            <div className="progress-card"><div><strong>다음 구역까지</strong><span>320 / 500 별빛</span></div><div className="progress"><i /></div><p>별빛이 모이면 포근한 이웃 구역의 구름이 걷혀요.</p></div>
            <div className="tip-card"><span>🌈</span><strong>태블릿에서 더 넓게!</strong><p>주민과 건물을 눌러 마을을 둘러보세요.</p></div>
          </aside>
        </section>}

        {tab === '친구' && <section className="content-card"><p className="eyebrow">포근별 마을</p><h2>친구</h2><div className="card-grid">{residents.map((entry) => <button key={entry.name} className={`friend-card ${entry.color}`} onClick={() => setNotice(entry.activity)}><img className="friend-sprite" src={entry.sprite} alt="" /><strong>{entry.name}</strong><p>{entry.activity}</p></button>)}</div></section>}

        {tab === '꾸미기' && <section className="content-card"><p className="eyebrow">칭찬 토큰으로 꾸며요</p><h2>꾸미기</h2><div className="card-grid items">{items.map((item) => <button key={item.id} className="item-card" onClick={() => buy(item)}><span>{item.emoji}</span><strong>{item.name}</strong><em>{owned.includes(item.id) ? '보유 중' : `⭐ ${item.cost}`}</em></button>)}</div></section>}

        {tab === '앨범' && <section className="content-card album"><p className="eyebrow">우리 가족의 반짝이는 기록</p><h2>칭찬 앨범</h2><article><span>💌</span><div><small>정리 칭찬</small><p>스스로 장난감을 정리해서 정말 멋졌어!</p></div><strong>+3</strong></article>{owned.map((id) => { const item = items.find((entry) => entry.id === id); return item ? <article key={id}><span>{item.emoji}</span><div><small>마을 꾸미기</small><p>{item.name}을 마을에 놓았어요.</p></div><strong className="spent">-{item.cost}</strong></article> : null; })}</section>}

        <nav className="tabbar" aria-label="게임 메뉴">{tabs.map((entry) => <button key={entry.name} className={tab === entry.name ? 'active' : ''} onClick={() => selectTab(entry.name)}><span>{entry.emoji}</span>{entry.name}</button>)}</nav>
      </div>
      {notice && <button className="toast" onClick={() => setNotice('')} aria-live="polite">{notice}<span>×</span></button>}
    </main>
  );
}
