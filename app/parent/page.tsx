'use client';

import { useEffect, useState } from 'react';
import { normalizeFamilyCode, PRAISE_TIERS, type PraiseTier } from '../../src/game/family';

const PARENT_CODE_KEY = 'pogeun-star-village-parent-code';

export default function ParentPage() {
  const [familyCode, setFamilyCode] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [message, setMessage] = useState('');
  const [tier, setTier] = useState<PraiseTier>('warm');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    try {
      const saved = window.localStorage.getItem(PARENT_CODE_KEY);
      if (saved) timer = window.setTimeout(() => setFamilyCode(saved), 0);
    } catch { /* private browsing */ }
    return () => { if (timer) window.clearTimeout(timer); };
  }, []);

  async function joinFamily() {
    const code = normalizeFamilyCode(codeInput);
    if (code.length !== 6) {
      setJoinError('6자리 코드를 정확히 입력해주세요.');
      return;
    }
    setJoining(true);
    setJoinError(null);
    try {
      const response = await fetch(`/api/family?code=${code}`);
      const data = await response.json() as { exists?: boolean };
      if (!data.exists) {
        setJoinError('아이 화면에서 만든 코드와 다른 것 같아요. 다시 확인해주세요.');
        return;
      }
      window.localStorage.setItem(PARENT_CODE_KEY, code);
      setFamilyCode(code);
    } catch {
      setJoinError('연결에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setJoining(false);
    }
  }

  async function sendPraise() {
    if (!familyCode || !message.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      const response = await fetch('/api/praise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: familyCode, message: message.trim(), tier }),
      });
      if (!response.ok) throw new Error('send_failed');
      setMessage('');
      setSentNotice(true);
      window.setTimeout(() => setSentNotice(false), 2400);
    } catch {
      setSendError('전송에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSending(false);
    }
  }

  function unlink() {
    window.localStorage.removeItem(PARENT_CODE_KEY);
    setFamilyCode(null);
    setCodeInput('');
  }

  return (
    <main className="parent-shell">
      <div className="parent-card">
        <h1>👪 포근별 마을 · 부모 화면</h1>
        {!familyCode ? (
          <>
            <p>아이 화면의 <strong>가족 연동하기</strong>에서 만든 6자리 코드를 입력해주세요.</p>
            <input
              className="parent-code-input"
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
              placeholder="예: AB12CD"
              maxLength={6}
              autoCapitalize="characters"
            />
            <button className="parent-primary-button" onClick={joinFamily} disabled={joining}>
              {joining ? '연결하는 중...' : '연결하기'}
            </button>
            {joinError && <p className="parent-error">{joinError}</p>}
          </>
        ) : (
          <>
            <p className="parent-linked">연결됨 · 코드 {familyCode} <button className="parent-unlink" onClick={unlink}>다른 코드로 변경</button></p>
            <label className="parent-field-label" htmlFor="praise-message">어떤 점이 멋졌나요?</label>
            <textarea
              id="praise-message"
              className="parent-textarea"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={120}
              placeholder="예: 스스로 장난감을 정리해서 정말 멋졌어!"
              rows={3}
            />
            <div className="parent-tiers">
              {(Object.entries(PRAISE_TIERS) as [PraiseTier, typeof PRAISE_TIERS[PraiseTier]][]).map(([key, info]) => (
                <button
                  key={key}
                  className={`parent-tier ${tier === key ? 'selected' : ''}`}
                  onClick={() => setTier(key)}
                  type="button"
                >
                  <span>{info.emoji}</span>
                  <strong>{info.label}</strong>
                  <small>+{info.tokens} 토큰 · +{info.starlight} 별빛</small>
                </button>
              ))}
            </div>
            <button className="parent-primary-button" onClick={sendPraise} disabled={sending || !message.trim()}>
              {sending ? '보내는 중...' : '칭찬 보내기'}
            </button>
            {sendError && <p className="parent-error">{sendError}</p>}
            {sentNotice && <p className="parent-sent-notice">칭찬을 보냈어요! 아이 화면에 곧 나타나요 💌</p>}
          </>
        )}
      </div>
    </main>
  );
}
