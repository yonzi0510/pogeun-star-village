import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';
import { isPraiseTier, normalizeFamilyCode, PRAISE_TIERS } from '../../../src/game/family';

// 부모 화면에서 칭찬 한 건을 보낸다.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { code?: unknown; message?: unknown; tier?: unknown } | null;
  const code = normalizeFamilyCode(typeof body?.code === 'string' ? body.code : '');
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 120) : '';
  const tier = body?.tier;

  if (code.length !== 6 || !message || !isPraiseTier(tier)) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const family = await env.DB.prepare('SELECT code FROM families WHERE code = ?').bind(code).first();
  if (!family) {
    return NextResponse.json({ error: 'family_not_found' }, { status: 404 });
  }

  const { tokens, starlight } = PRAISE_TIERS[tier];
  const result = await env.DB
    .prepare('INSERT INTO praise_events (family_code, message, tier, tokens, starlight) VALUES (?, ?, ?, ?, ?)')
    .bind(code, message, tier, tokens, starlight)
    .run();

  return NextResponse.json({ ok: true, id: result.meta.last_row_id });
}

// 아이 화면이 주기적으로 폴링해 새 칭찬을 가져간다. afterId보다 큰 것만 반환.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = normalizeFamilyCode(url.searchParams.get('code') ?? '');
  const afterId = Number(url.searchParams.get('afterId') ?? '0') || 0;

  if (code.length !== 6) {
    return NextResponse.json({ error: 'invalid_code' }, { status: 400 });
  }

  const { results } = await env.DB
    .prepare(
      'SELECT id, message, tier, tokens, starlight, created_at as createdAt FROM praise_events WHERE family_code = ? AND id > ? ORDER BY id ASC LIMIT 20',
    )
    .bind(code, afterId)
    .all();

  return NextResponse.json({ events: results ?? [] });
}
