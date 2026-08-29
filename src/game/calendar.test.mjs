import assert from 'node:assert/strict';
import test from 'node:test';

import { getActiveSeasonalEvent } from './calendar.ts';

test('행사 기간 안의 날짜는 해당 계절 행사를 반환한다', () => {
  const event = getActiveSeasonalEvent(new Date('2026-04-01T00:00:00'));

  assert.equal(event?.id, 'spring-flower');
});

test('행사 기간 경계일도 포함한다', () => {
  const start = getActiveSeasonalEvent(new Date('2026-12-15T00:00:00'));
  const end = getActiveSeasonalEvent(new Date('2026-12-31T00:00:00'));

  assert.equal(start?.id, 'winter-snow');
  assert.equal(end?.id, 'winter-snow');
});

test('행사 기간이 아니면 null을 반환한다', () => {
  const event = getActiveSeasonalEvent(new Date('2026-05-15T00:00:00'));

  assert.equal(event, null);
});
