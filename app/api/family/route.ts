import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { generateFamilyCode, normalizeFamilyCode } from '../../../src/game/family';

// 아이 기기에서 최초 1회 호출해 가족 코드를 발급한다. 그 코드를 부모가
// /parent 화면에 입력하면 두 기기가 같은 family_code를 공유하게 된다.
export async function POST() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateFamilyCode();
    try {
      await env.DB.prepare('INSERT INTO families (code) VALUES (?)').bind(code).run();
      return NextResponse.json({ code });
    } catch {
      // 코드 중복(희박한 확률) — 다시 생성해서 재시도
    }
  }
  return NextResponse.json({ error: 'family_create_failed' }, { status: 500 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = normalizeFamilyCode(url.searchParams.get('code') ?? '');
  if (code.length !== 6) {
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
  }
  const row = await env.DB.prepare('SELECT code FROM families WHERE code = ?').bind(code).first();
  return NextResponse.json({ exists: Boolean(row) });
}
