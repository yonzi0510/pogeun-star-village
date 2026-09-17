'use client';

import { useState } from 'react';

type Props = {
  familyCode: string | null;
  creating: boolean;
  error: string | null;
  onCreate: () => void;
  onClose: () => void;
};

// 아이 화면에서 가족 코드를 처음 만들거나 다시 확인하는 팝업.
// 이 코드를 부모가 /parent 화면에 입력하면 두 기기가 연결된다.
export function FamilyLinkModal({ familyCode, creating, error, onCreate, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    if (!familyCode) return;
    try {
      await navigator.clipboard.writeText(familyCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 권한이 없어도 코드는 화면에 그대로 보이니 문제 없음
    }
  }

  return (
    <div className="family-modal-backdrop" role="dialog" aria-modal="true" aria-label="가족 연동">
      <div className="family-modal">
        <button className="family-modal-close" onClick={onClose} aria-label="닫기">×</button>
        <h2>👪 부모님과 연동하기</h2>
        {familyCode ? (
          <>
            <p>이 코드를 부모님 폰의 <strong>부모 화면</strong>에 입력하면 칭찬을 보낼 수 있어요.</p>
            <div className="family-code">
              <strong>{familyCode}</strong>
              <button onClick={copyCode}>{copied ? '복사됨!' : '복사'}</button>
            </div>
            <p className="family-modal-hint">부모님은 이 앱 주소 뒤에 <code>/parent</code>를 붙여 접속하면 돼요.</p>
          </>
        ) : (
          <>
            <p>아직 연동된 가족 코드가 없어요. 코드를 만들면 부모님이 칭찬을 보낼 수 있게 돼요.</p>
            <button className="family-code-create" onClick={onCreate} disabled={creating}>
              {creating ? '코드 만드는 중...' : '가족 코드 만들기'}
            </button>
            {error && <p className="family-modal-error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
