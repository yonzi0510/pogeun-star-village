import assert from 'node:assert/strict';
import test from 'node:test';

import { awardPraise, buyItem, getVillageProgress, initialGameState } from './state.ts';

test('칭찬은 토큰과 별빛을 함께 증가시킨다', () => {
  const next = awardPraise(initialGameState, {
    id: 'praise-test-1',
    message: '끝까지 해냈구나!',
    category: '노력',
    tokens: 4,
    createdAt: '2026-08-25T10:00:00.000Z',
  });

  assert.equal(next.tokenBalance, 28);
  assert.equal(next.starlight, 360);
  assert.equal(next.praiseEvents[0].category, '노력');
  assert.equal(next.transactions[0].kind, 'earn');
});

test('같은 칭찬 이벤트는 중복 지급하지 않는다', () => {
  const duplicate = awardPraise(initialGameState, initialGameState.praiseEvents[0]);
  assert.equal(duplicate, initialGameState);
});

test('아이템 구매는 토큰을 차감하고 거래 원장을 남긴다', () => {
  const next = buyItem(initialGameState, {
    itemId: 'cloud-swing',
    itemName: '구름 그네',
    cost: 10,
    transactionId: 'buy-test-1',
    createdAt: '2026-08-25T10:00:00.000Z',
  });

  assert.equal(next.tokenBalance, 14);
  assert.deepEqual(next.ownedItemIds, ['cloud-swing']);
  assert.equal(next.transactions[0].kind, 'spend');
});

test('잔액보다 비싼 아이템은 구매할 수 없다', () => {
  assert.throws(
    () => buyItem(initialGameState, {
      itemId: 'star-castle',
      itemName: '별빛 성',
      cost: 100,
      transactionId: 'buy-test-2',
      createdAt: '2026-08-25T10:00:00.000Z',
    }),
    /부족/,
  );
});

test('별빛이 적으면 작은 언덕 단계이고 모모몽만 등장한다', () => {
  const progress = getVillageProgress(0);

  assert.equal(progress.stageIndex, 0);
  assert.equal(progress.stage.name, '작은 언덕');
  assert.deepEqual(progress.stage.unlockedResidents, ['모모몽']);
  assert.equal(progress.nextThreshold, 500);
  assert.equal(progress.progressToNext, 0);
});

test('별빛 500 이상이면 포근한 이웃 단계로 성장한다', () => {
  const progress = getVillageProgress(500);

  assert.equal(progress.stageIndex, 1);
  assert.equal(progress.stage.name, '포근한 이웃');
  assert.deepEqual(progress.stage.unlockedResidents, ['모모몽', '포포', '두리콩']);
});

test('단계 사이에서는 다음 단계까지의 진행률을 계산한다', () => {
  const progress = getVillageProgress(320);

  assert.equal(progress.stageIndex, 0);
  assert.equal(progress.progressToNext, 320 / 500);
});

test('마지막 구현 단계에 도달하면 다음 단계가 없다', () => {
  const progress = getVillageProgress(9999);

  assert.equal(progress.stageIndex, 2);
  assert.equal(progress.nextStage, null);
  assert.equal(progress.nextThreshold, null);
  assert.equal(progress.progressToNext, 1);
});
