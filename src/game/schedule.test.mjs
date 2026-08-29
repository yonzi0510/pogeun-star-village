import assert from 'node:assert/strict';
import test from 'node:test';

import { getDayPeriod, getResidentActivity } from './schedule.ts';

test('시간대에 따라 하루를 아침/낮/저녁/밤으로 나눈다', () => {
  assert.equal(getDayPeriod(new Date('2026-08-25T06:00:00')), '아침');
  assert.equal(getDayPeriod(new Date('2026-08-25T12:00:00')), '낮');
  assert.equal(getDayPeriod(new Date('2026-08-25T18:00:00')), '저녁');
  assert.equal(getDayPeriod(new Date('2026-08-25T23:00:00')), '밤');
  assert.equal(getDayPeriod(new Date('2026-08-25T02:00:00')), '밤');
});

test('주민마다 시간대별로 다른 활동을 한다', () => {
  assert.equal(getResidentActivity('포포', new Date('2026-08-25T06:00:00')), '구름정원에 물을 주는 중');
  assert.equal(getResidentActivity('포포', new Date('2026-08-25T23:00:00')), '포근하게 낮잠에 빠진 중');
});

test('등록되지 않은 이름은 기본 활동 문구를 반환한다', () => {
  assert.equal(getResidentActivity('알수없음', new Date('2026-08-25T12:00:00')), '마을에서 지내는 중');
});
