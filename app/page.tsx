'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';

type Tab = '마을' | '친구' | '별뽑기' | '꾸미기' | '앨범';

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

const tabs: { name: Tab; icon: string }[] = [
  { name: '마을', icon: 'village' }, { name: '친구', icon: 'friends' },
  { name: '별뽑기', icon: 'gacha' }, { name: '꾸미기', icon: 'decorate' }, { name: '앨범', icon: 'album' },
];

function DrawingPad({ onDraw }: { onDraw: (image: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const previous = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState('#ff7895');
  const [tool, setTool] = useState<'marker' | 'pencil' | 'brush' | 'airbrush' | 'pearl' | 'glitter'>('marker');
  const colors = [
    ['#ff7895','딸기 분홍'],['#ef4444','사과 빨강'],['#ff8c42','귤 주황'],['#ffd93d','레몬 노랑'],
    ['#9bd35a','연두'],['#38b878','초록'],['#55d6c2','민트'],['#5bc0eb','하늘'],['#3f72d8','파랑'],
    ['#7755cc','보라'],['#c087e8','라벤더'],['#8b5e3c','초코'],['#55505c','먹색'],['rainbow','무지개'],
  ];

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  }
  function start(event: PointerEvent<HTMLCanvasElement>) {
    event.preventDefault(); drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId);
    const context = event.currentTarget.getContext('2d')!; const p = point(event);
    previous.current = p; context.beginPath(); context.moveTo(p.x, p.y);
  }
  function draw(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return; event.preventDefault(); const context = event.currentTarget.getContext('2d')!; const p = point(event);
    let stroke: string | CanvasGradient = color;
    if (color === 'rainbow') { const gradient = context.createLinearGradient(0, 0, event.currentTarget.width, 0); ['#ff5b73','#ff9c43','#ffe04b','#55c878','#51bce8','#8768d8','#e879c6'].forEach((entry, index) => gradient.addColorStop(index / 6, entry)); stroke = gradient; }
    if (tool === 'airbrush') {
      for (let index = 0; index < 28; index += 1) { const angle = Math.random() * Math.PI * 2; const radius = Math.random() * 18; context.beginPath(); context.globalAlpha = .12 + Math.random() * .18; context.fillStyle = color === 'rainbow' ? ['#ff7895','#ffd93d','#55d6c2','#7755cc'][index % 4] : color; context.arc(p.x + Math.cos(angle) * radius, p.y + Math.sin(angle) * radius, 1.5 + Math.random() * 2.5, 0, Math.PI * 2); context.fill(); }
    } else {
      context.globalAlpha = tool === 'pencil' ? .72 : 1; context.strokeStyle = stroke; context.lineWidth = tool === 'pencil' ? 3 : tool === 'brush' ? 13 : tool === 'pearl' ? 14 : tool === 'glitter' ? 7 : 8; context.lineCap = 'round'; context.lineJoin = 'round'; context.beginPath(); context.moveTo(previous.current.x, previous.current.y); context.lineTo(p.x, p.y); context.stroke();
      if (tool === 'pearl') { for (let index = 0; index < 13; index += 1) { context.beginPath(); context.globalAlpha = .45 + Math.random() * .4; context.fillStyle = '#fff'; context.arc(p.x + (Math.random() - .5) * 11, p.y + (Math.random() - .5) * 11, .5 + Math.random() * 1.35, 0, Math.PI * 2); context.fill(); } }
      if (tool === 'glitter') { for (let index = 0; index < 8; index += 1) { context.beginPath(); context.globalAlpha = .85; context.fillStyle = index % 2 ? '#fff' : color === 'rainbow' ? '#ffd34e' : color; context.arc(p.x + (Math.random() - .5) * 25, p.y + (Math.random() - .5) * 25, 1.5 + Math.random() * 3, 0, Math.PI * 2); context.fill(); } }
    }
    context.globalAlpha = 1; previous.current = p;
    onDraw(event.currentTarget.toDataURL('image/png'));
  }
  function clear() {
    const canvas = canvasRef.current!; canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height); onDraw('');
  }
  return <div className="drawing-pad"><div className="drawing-title"><strong>🖍️ 알록달록 그림 편지</strong><button className="eraser" onClick={clear}>모두 지우기</button></div><div className="drawing-tools color-tools"><span>색</span>{colors.map(([entry, label]) => <button key={entry} className={color === entry ? 'chosen' : ''} style={{ background: entry === 'rainbow' ? 'linear-gradient(135deg,#ff5b73,#ffe04b,#55c878,#51bce8,#8768d8,#e879c6)' : entry }} onClick={() => setColor(entry)} aria-label={label} title={label} />)}</div><div className="finish-tools tool-tools"><span>도구</span><button className={tool === 'marker' ? 'chosen' : ''} onClick={() => setTool('marker')}>🖍️ 매직</button><button className={tool === 'pencil' ? 'chosen' : ''} onClick={() => setTool('pencil')}>✏️ 연필</button><button className={tool === 'brush' ? 'chosen' : ''} onClick={() => setTool('brush')}>🖌️ 붓</button><button className={tool === 'airbrush' ? 'chosen' : ''} onClick={() => setTool('airbrush')}>☁️ 에어</button><button className={`pearl-finish ${tool === 'pearl' ? 'chosen' : ''}`} onClick={() => setTool('pearl')}>🫧 펄 크레용</button><button className={`glitter-finish ${tool === 'glitter' ? 'chosen' : ''}`} onClick={() => setTool('glitter')}>✨ 글리터</button></div><canvas ref={canvasRef} width="520" height="260" onPointerDown={start} onPointerMove={draw} onPointerUp={() => drawing.current = false} onPointerCancel={() => drawing.current = false} aria-label="손가락으로 그림을 그리는 편지지" /></div>;
}

export default function Home() {
  const saveReady = useRef(false);
  const [allowPortrait, setAllowPortrait] = useState(false);
  const [tab, setTab] = useState<Tab>('마을');
  const [selected, setSelected] = useState('모모몽');
  const [tokens, setTokens] = useState(24);
  const [starlight, setStarlight] = useState(320);
  const [owned, setOwned] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [gameMinutes, setGameMinutes] = useState(8 * 60 + 10);
  const [building, setBuilding] = useState<{ name: string; icon: string; message: string } | null>(null);
  const [watered, setWatered] = useState<number[]>([]);
  const [letterOpened, setLetterOpened] = useState(false);
  const [postMode, setPostMode] = useState<'read' | 'write'>('read');
  const [letterText, setLetterText] = useState('');
  const [drawingData, setDrawingData] = useState('');
  const [sentLetters, setSentLetters] = useState<{ text: string; drawing: string }[]>([]);
  const [collectedPets, setCollectedPets] = useState(['모모몽']);
  const [activePet, setActivePet] = useState('모모몽');
  const [petLove, setPetLove] = useState<Record<string, number>>({ '모모몽': 35 });
  const [gachaStage, setGachaStage] = useState<'idle' | 'inserting' | 'coin' | 'rattling' | 'dropped' | 'opened'>('idle');
  const [insertedTokens, setInsertedTokens] = useState(0);
  const [knobAngle, setKnobAngle] = useState(0);
  const knobDrag = useRef({ active: false, lastAngle: 0, distance: 0 });
  const [pendingPrize, setPendingPrize] = useState<string | null>(null);
  const [lastPrize, setLastPrize] = useState<string | null>(null);
  const [positions, setPositions] = useState([{ x: 34, y: 65 }, { x: 45, y: 72 }, { x: 57, y: 64 }, { x: 68, y: 73 }]);
  const resident = residents.find((entry) => entry.name === selected) ?? residents[1];

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('pogeun-star-village-save-v1') ?? 'null');
      if (saved && typeof saved === 'object') {
        if (typeof saved.tokens === 'number') setTokens(saved.tokens);
        if (typeof saved.starlight === 'number') setStarlight(saved.starlight);
        if (Array.isArray(saved.owned)) setOwned(saved.owned);
        if (Array.isArray(saved.watered)) setWatered(saved.watered);
        if (typeof saved.letterOpened === 'boolean') setLetterOpened(saved.letterOpened);
        if (Array.isArray(saved.sentLetters)) setSentLetters(saved.sentLetters.slice(-20));
        if (Array.isArray(saved.collectedPets)) setCollectedPets(saved.collectedPets);
        if (typeof saved.activePet === 'string') setActivePet(saved.activePet);
        if (saved.petLove && typeof saved.petLove === 'object') setPetLove(saved.petLove);
        if (Array.isArray(saved.positions) && saved.positions.length === residents.length) setPositions(saved.positions);
        if (typeof saved.insertedTokens === 'number' && saved.insertedTokens > 0 && saved.insertedTokens <= 5) {
          setInsertedTokens(saved.insertedTokens);
          setGachaStage(saved.insertedTokens === 5 ? 'coin' : 'inserting');
        }
      }
    } catch { /* a damaged save simply starts a fresh village */ }
    saveReady.current = true;
  }, []);
  useEffect(() => {
    if (!saveReady.current) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem('pogeun-star-village-save-v1', JSON.stringify({ tokens, starlight, owned, watered, letterOpened, sentLetters: sentLetters.slice(-20), collectedPets, activePet, petLove, positions, insertedTokens }));
      } catch { /* private browsing or a full device store should not stop play */ }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [tokens, starlight, owned, watered, letterOpened, sentLetters, collectedPets, activePet, petLove, positions, insertedTokens]);
  useEffect(() => {
    const timer = window.setInterval(() => setPositions((current) => current.map((position, index) => index === 1 ? position : ({
      x: Math.max(22, Math.min(76, position.x + (Math.random() - .5) * 15)),
      y: Math.max(52, Math.min(79, position.y + (Math.random() - .5) * 10)),
    }))), 2200);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setGameMinutes((value) => (value + 10) % 1440), 4000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    function moveWithKeys(event: KeyboardEvent) {
      const delta = event.key === 'ArrowLeft' ? [-3, 0] : event.key === 'ArrowRight' ? [3, 0] : event.key === 'ArrowUp' ? [0, -3] : event.key === 'ArrowDown' ? [0, 3] : null;
      if (!delta) return;
      event.preventDefault();
      setPositions((current) => current.map((position, index) => index === 1 ? { x: Math.max(15, Math.min(85, position.x + delta[0])), y: Math.max(42, Math.min(84, position.y + delta[1])) } : position));
    }
    window.addEventListener('keydown', moveWithKeys);
    return () => window.removeEventListener('keydown', moveWithKeys);
  }, []);

  const timeLabel = `${String(Math.floor(gameMinutes / 60)).padStart(2, '0')}:${String(gameMinutes % 60).padStart(2, '0')}`;

  function movePlayer(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(15, Math.min(85, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(42, Math.min(84, ((event.clientY - rect.top) / rect.height) * 100));
    setPositions((current) => current.map((position, index) => index === 1 ? { x, y } : position));
    setSelected('모모몽');
  }

  function talkTo(name: string, index: number, activity: string) {
    const destination = positions[index] ?? { x: 50, y: 65 };
    setPositions((current) => current.map((position, positionIndex) => positionIndex === 1 ? { x: Math.max(15, destination.x - 8), y: destination.y } : position));
    setSelected(name);
    setNotice(`${name}: ${activity}`);
  }

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

  function waterFlower(index: number) {
    if (watered.includes(index)) return setNotice('이 꽃은 벌써 촉촉해요!');
    const next = [...watered, index];
    setWatered(next);
    if (next.length === 3) {
      setTokens((value) => value + 3);
      setNotice('정원 임무 완료! 포포가 칭찬 토큰 3개를 주었어요.');
    } else setNotice(`꽃에 물을 주었어요! ${next.length}/3`);
  }

  function openLetter() {
    if (!letterOpened) {
      setLetterOpened(true);
      setTokens((value) => value + 3);
      setNotice('칭찬 편지를 읽고 토큰 3개를 받았어요!');
    }
  }

  function sendLetter() {
    if (!letterText.trim() && !drawingData) return setNotice('글을 쓰거나 그림을 그려 주세요!');
    setSentLetters((current) => [...current, { text: letterText.trim(), drawing: drawingData }]);
    setNotice('두리콩이 가족에게 손편지를 전해 주러 출발했어요!');
    setLetterText(''); setDrawingData(''); setPostMode('read');
  }

  function insertGachaToken() {
    if (!['idle','inserting','opened'].includes(gachaStage)) return;
    if (tokens < 1) return setNotice('넣을 칭찬 토큰이 없어요!');
    const restarting = gachaStage === 'opened';
    const next = restarting ? 1 : insertedTokens + 1;
    setTokens((value) => value - 1); setInsertedTokens(next); setLastPrize(null); setPendingPrize(null);
    setGachaStage(next === 5 ? 'coin' : 'inserting');
    setNotice(next === 5 ? '토큰 5개를 모두 넣었어요. 손잡이를 한 바퀴 돌려요!' : `토큰을 하나 넣었어요. ${next}/5`);
  }

  function knobPointerAngle(event: PointerEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI;
  }

  function startKnobTurn(event: PointerEvent<HTMLButtonElement>) {
    if (gachaStage !== 'coin') return;
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    knobDrag.current = { active: true, lastAngle: knobPointerAngle(event), distance: 0 };
  }

  function moveKnobTurn(event: PointerEvent<HTMLButtonElement>) {
    if (!knobDrag.current.active || gachaStage !== 'coin') return;
    event.preventDefault(); const angle = knobPointerAngle(event); let delta = angle - knobDrag.current.lastAngle;
    if (delta > 180) delta -= 360; if (delta < -180) delta += 360;
    knobDrag.current.lastAngle = angle; knobDrag.current.distance += Math.abs(delta); setKnobAngle((value) => value + delta);
    if (knobDrag.current.distance >= 300) { knobDrag.current.active = false; startGachaRattle(); }
  }

  function startGachaRattle() {
    setGachaStage('rattling'); setNotice('달그락, 달그락… 어떤 캡슐이 나올까요?');
    window.setTimeout(() => {
      const prize = residents[Math.floor(Math.random() * residents.length)];
      setPendingPrize(prize.name); setGachaStage('dropped'); setNotice('달그락! 캡슐이 나왔어요. 눌러서 열어 보세요!');
    }, 2200);
  }

  function openGachaCapsule() {
    if (gachaStage !== 'dropped' || !pendingPrize) return;
    const prize = residents.find((entry) => entry.name === pendingPrize) ?? residents[1];
    const duplicate = collectedPets.includes(prize.name);
    setLastPrize(prize.name); setActivePet(prize.name); setGachaStage('opened'); setInsertedTokens(0);
    setPetLove((current) => ({ ...current, [prize.name]: current[prize.name] ?? 20 }));
    setCollectedPets((current) => current.includes(prize.name) ? current : [...current, prize.name]);
    if (duplicate) { setStarlight((value) => value + 30); setNotice(`${prize.name}을 다시 만나 별빛 30개를 받았어요!`); }
    else setNotice(`짜잔! 새 친구 ${prize.name}이 포근별 마을에 왔어요!`);
  }

  function carePet(action: string) {
    setPetLove((current) => ({ ...current, [activePet]: Math.min(100, (current[activePet] ?? 20) + 8) }));
    setNotice(`${activePet}에게 ${action}! 애정도가 올랐어요 💗`);
  }

  async function requestLandscape() {
    try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.(); } catch { /* browser may keep its normal chrome */ }
    try { await (screen.orientation as ScreenOrientation & { lock?: (mode: string) => Promise<void> }).lock?.('landscape'); } catch { /* orientation lock is not supported in every browser */ }
    setAllowPortrait(true);
  }

  return (
    <main className={`game-shell ${allowPortrait ? 'portrait-allowed' : ''}`}>
      <div className="sky-decor" aria-hidden="true"><span>☁️</span><span>✨</span><span>☁️</span></div>
      <div className="game-frame">
        <header className="topbar">
          <div><p className="eyebrow">칭찬이 별빛이 되는 곳</p><h1>포근별 마을 <span>✨</span></h1></div>
          <div className="stats" aria-label="게임 재화">
            <div className="stat token-stat"><img src="/praise-token-3d.png" alt="" /><p>칭찬 토큰<strong>{tokens}</strong></p></div>
            <div className="stat"><span>💫</span><p>별빛<strong>{starlight}</strong></p></div>
            <div className="stat clock"><span>🌤️</span><p>포근한 아침<strong>{timeLabel}</strong></p></div>
          </div>
        </header>

        <section className={`home-grid ${tab !== '마을' ? 'background-world' : ''}`} aria-hidden={tab !== '마을'}>
          <div className="village-card illustrated">
            <img src="/village-map.png" alt="산책할 수 있는 포근별 마을 광장" />
            <div className="map-walk-layer" onPointerDown={movePlayer} role="application" aria-label="눌러서 모모몽을 이동시키는 마을 지도" />
            <div className="village-heading"><span className="stage-pill">작은 언덕 · 1단계</span><h2>우리 마을이 자라고 있어요!</h2></div>
            <button className="map-hit house-hit" aria-label="모모몽의 집에 들어가기" onClick={() => setBuilding({ name: '모모몽의 집', icon: '🏡', message: '포근한 침대와 장난감 상자가 있어요. 앞으로 가구를 직접 배치할 수 있게 됩니다.' })} />
            <button className="map-hit garden-hit" aria-label="구름정원에 들어가기" onClick={() => setBuilding({ name: '구름정원', icon: '🌳', message: '포포와 꽃에 물을 주고 별씨앗을 심을 수 있는 정원이에요.' })} />
            <button className="map-hit post-hit" aria-label="별빛우체국에 들어가기" onClick={() => setBuilding({ name: '별빛우체국', icon: '📮', message: '두리콩이 가족의 칭찬 편지를 보관하고 있어요.' })} />
            <div className="moving-layer">{residents.map((entry, index) => <button key={entry.name} className={`moving-character ${index === 1 ? 'player' : 'npc'} ${selected === entry.name ? 'selected' : ''}`} style={{ left: `${positions[index]?.x ?? 50}%`, top: `${positions[index]?.y ?? 65}%` }} onClick={(event) => { event.stopPropagation(); index === 1 ? setNotice('지도를 눌러 모모몽을 움직여 보세요!') : talkTo(entry.name, index, entry.activity); }} aria-label={index === 1 ? '내 캐릭터 모모몽' : `${entry.name}에게 다가가 말 걸기`}><img src={entry.sprite} alt="" /><span>{index === 1 ? '내 모모몽' : entry.name}</span></button>)}</div>
            <div className="move-guide">지도를 눌러 이동 · 방향키도 가능</div>
            <div className="speech"><strong>{resident?.name}</strong><span>{resident?.activity}</span></div>
          </div>
          <aside className="side-panel">
            <div className="praise-card"><div><small>오늘 받은 따뜻한 칭찬</small><p>“스스로 장난감을 정리해서 정말 멋졌어!”</p></div><strong>+3</strong></div>
            <div className="progress-card"><div><strong>다음 구역까지</strong><span>320 / 500 별빛</span></div><div className="progress"><i /></div><p>별빛이 모이면 포근한 이웃 구역의 구름이 걷혀요.</p></div>
            <div className="tip-card"><span>🌈</span><strong>태블릿에서 더 넓게!</strong><p>주민과 건물을 눌러 마을을 둘러보세요.</p></div>
          </aside>
        </section>

        {tab === '친구' && <section className="content-card"><p className="eyebrow">포근별 마을</p><h2>친구</h2><div className="card-grid">{residents.map((entry) => <button key={entry.name} className={`friend-card ${entry.color}`} onClick={() => setNotice(entry.activity)}><img className="friend-sprite" src={entry.sprite} alt="" /><strong>{entry.name}</strong><p>{entry.activity}</p></button>)}</div></section>}

        {tab === '별뽑기' && <section className="content-card gacha-card"><p className="eyebrow">토큰을 하나씩 넣고 손잡이를 직접 돌려요</p><h2>포근별 캡슐 가챠</h2><div className="gacha-grid"><div className="star-machine dimensional"><div className={`physical-gacha art-machine ${gachaStage}`}><img className="machine-art" src="/gacha-machine.png" alt="포근별 캡슐 가챠 기계" /><div className="token-meter" aria-label={`토큰 ${insertedTokens}/5개 투입`}>{[0,1,2,3,4].map((index) => <i key={index} className={index < insertedTokens ? 'filled' : ''}><img src="/praise-token-3d.png" alt="" /></i>)}</div><button className={`coin-slot art-control ${gachaStage === 'coin' ? 'ready' : ''}`} onClick={insertGachaToken} disabled={!['idle','inserting','opened'].includes(gachaStage)} aria-label="칭찬 토큰 한 개 넣기"><img src="/praise-token-3d.png" alt="" />톡 넣기</button><button className={`gacha-knob art-control ${gachaStage === 'coin' ? 'ready' : ''}`} onPointerDown={startKnobTurn} onPointerMove={moveKnobTurn} onPointerUp={() => knobDrag.current.active = false} onPointerCancel={() => knobDrag.current.active = false} disabled={gachaStage !== 'coin'} style={{ transform: `rotate(${knobAngle}deg)` }} aria-label="손가락으로 가챠 손잡이 돌리기"><i /><strong>{gachaStage === 'coin' ? '빙글 돌려요' : '잠김'}</strong></button><div className="capsule-chute art-control">{gachaStage === 'dropped' ? <button className="dropped-capsule" onClick={openGachaCapsule} aria-label="나온 캡슐 열기"><img src="/capsule-3d.png" alt="" /><span>톡! 열기</span></button> : <span>{gachaStage === 'rattling' ? '달그락 달그락…' : '캡슐 나오는 곳'}</span>}</div>{lastPrize && gachaStage === 'opened' && <div className="prize-reveal"><img src={residents.find((entry) => entry.name === lastPrize)?.sprite} alt={`${lastPrize} 등장`} /><strong>{lastPrize}!</strong></div>}</div><p className="gacha-guide">① 토큰을 5번 눌러 넣기　② 손잡이를 손가락으로 한 바퀴 돌리기　③ 캡슐 열기</p><small>가족에게 받은 칭찬 토큰만 사용해요.</small></div><div className="pet-care">{(() => { const pet = residents.find((entry) => entry.name === activePet) ?? residents[1]; const love = petLove[activePet] ?? 20; return <><p className="pet-name"><small>나의 포근펫</small><strong>{pet.name}</strong></p><img src={pet.sprite} alt={`${pet.name} 돌보기`} /><div className="love-label"><span>애정도</span><strong>{love}/100 💗</strong></div><div className="love-meter"><i style={{ width: `${love}%` }} /></div><div className="care-actions"><button onClick={() => carePet('별쿠키를 주었어요')}>🍪 간식</button><button onClick={() => carePet('신나게 놀아주었어요')}>🧸 놀기</button><button onClick={() => carePet('포근하게 쓰다듬었어요')}>🫶 쓰담</button></div></>; })()}</div></div><div className="pet-collection"><strong>만난 친구들 {collectedPets.length}/{residents.length}</strong><div>{residents.map((pet) => <button key={pet.name} className={collectedPets.includes(pet.name) ? '' : 'locked'} disabled={!collectedPets.includes(pet.name)} onClick={() => setActivePet(pet.name)}><img src={pet.sprite} alt="" /><span>{collectedPets.includes(pet.name) ? pet.name : '아직 비밀'}</span></button>)}</div></div></section>}

        {tab === '꾸미기' && <section className="content-card"><p className="eyebrow">칭찬 토큰으로 꾸며요</p><h2>꾸미기</h2><div className="card-grid items">{items.map((item) => <button key={item.id} className="item-card" onClick={() => buy(item)}><span>{item.emoji}</span><strong>{item.name}</strong><em>{owned.includes(item.id) ? '보유 중' : `⭐ ${item.cost}`}</em></button>)}</div></section>}

        {tab === '앨범' && <section className="content-card album"><p className="eyebrow">우리 가족의 반짝이는 기록</p><h2>칭찬 앨범</h2><article><span>💌</span><div><small>정리 칭찬</small><p>스스로 장난감을 정리해서 정말 멋졌어!</p></div><strong>+3</strong></article>{sentLetters.map((letter, index) => <article className="sent-letter-record" key={`letter-${index}`}>{letter.drawing ? <img src={letter.drawing} alt="직접 그린 그림 편지" /> : <span>✍️</span>}<div><small>내가 보낸 손편지</small><p>{letter.text || '그림으로 마음을 전했어요.'}</p></div><strong>💗</strong></article>)}{owned.map((id) => { const item = items.find((entry) => entry.id === id); return item ? <article key={id}><span>{item.emoji}</span><div><small>마을 꾸미기</small><p>{item.name}을 마을에 놓았어요.</p></div><strong className="spent">-{item.cost}</strong></article> : null; })}</section>}

        <nav className="tabbar" aria-label="게임 메뉴">{tabs.map((entry) => <button key={entry.name} className={tab === entry.name ? 'active' : ''} aria-current={tab === entry.name ? 'page' : undefined} onClick={() => selectTab(entry.name)}><span className={`menu-icon ${entry.icon}`} aria-hidden="true" />{entry.name}</button>)}</nav>
      </div>
      {notice && <button className="toast" onClick={() => setNotice('')} aria-live="polite">{notice}<span>×</span></button>}
      {building && <div className="modal-backdrop" role="presentation"><section className={`building-modal room ${building.name === '모모몽의 집' ? 'home-room' : building.name === '구름정원' ? 'garden-room' : 'post-room'}`} role="dialog" aria-modal="true" aria-label={building.name}>
        <header className="room-header"><div><p className="eyebrow">건물에 들어왔어요</p><h2>{building.icon} {building.name}</h2></div><button className="room-close" onClick={() => setBuilding(null)} aria-label="마을로 돌아가기">← 마을로</button></header>
        {building.name === '모모몽의 집' && <div className="room-play home-play"><div className="room-window">☀️<span>☁️</span></div><div className="bed">☁️<strong>포근 침대</strong></div><div className="placed-items">{owned.length ? owned.map((id) => { const item = items.find((entry) => entry.id === id); return item && <button key={id} onClick={() => setNotice(`${item.name}을(를) 예쁘게 놓았어요!`)}><span>{item.emoji}</span>{item.name}</button>; }) : <p>꾸미기 상점에서 가구를 사면<br />이 방에 나타나요!</p>}</div><img src="/momomong.png" alt="집 안의 모모몽" /></div>}
        {building.name === '구름정원' && <div className="room-play garden-play"><p className="quest-bubble">포포: 꽃 세 송이에 물을 주면<br /><strong>칭찬 토큰 3개</strong>를 줄게!</p><img src="/popo.png" alt="정원사 포포" /> <div className="flower-row">{['🌷','🌼','🌸'].map((flower, index) => <button key={flower} className={watered.includes(index) ? 'watered' : ''} onClick={() => waterFlower(index)}><span>{flower}</span>{watered.includes(index) ? '반짝반짝!' : '💧 물주기'}</button>)}</div></div>}
        {building.name === '별빛우체국' && <div className="room-play post-play"><div className="post-tabs"><button className={postMode === 'read' ? 'active' : ''} onClick={() => setPostMode('read')}>💌 받은 편지</button><button className={postMode === 'write' ? 'active' : ''} onClick={() => setPostMode('write')}>🖍️ 편지 보내기</button></div>{postMode === 'read' ? <div className="post-reader"><img src="/durikong.png" alt="우체부 두리콩" /><button className={`letter ${letterOpened ? 'opened' : ''}`} onClick={openLetter}>{letterOpened ? <><span>💌</span><strong>“스스로 정리해서 정말 멋졌어!”</strong><small>오늘의 칭찬을 앨범에 간직했어요.</small></> : <><span>✉️</span><strong>도착한 칭찬 편지</strong><small>눌러서 열어 보세요</small></>}</button>{sentLetters.length > 0 && <p className="sent-count">📮 보낸 손편지 {sentLetters.length}통</p>}</div> : <div className="letter-composer"><DrawingPad onDraw={setDrawingData} /><textarea value={letterText} onChange={(event) => setLetterText(event.target.value)} maxLength={100} placeholder="엄마 아빠에게 전하고 싶은 말을 직접 써 보세요…" aria-label="손편지 내용" /><button className="send-letter" onClick={sendLetter}>두리콩에게 전해주기 💌</button></div>}</div>}
        <p className="room-caption">{building.message}</p>
      </section></div>}
      <div className={`rotate-device ${allowPortrait ? 'dismissed' : ''}`} role="dialog" aria-label="가로 화면 권장 안내"><div className="rotate-phone" aria-hidden="true"><i /></div><h2>가로 화면으로 즐겨요</h2><p>포근별 마을은 가로 화면에서 가장 넓고 편하게 움직일 수 있어요.</p><button onClick={requestLandscape}>가로 전체화면 시작</button><button className="portrait-continue" onClick={() => setAllowPortrait(true)}>세로 화면으로 계속</button></div>
    </main>
  );
}
