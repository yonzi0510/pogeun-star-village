import assert from 'node:assert/strict';
import test from 'node:test';

import {
  awardPraise,
  buyItem,
  completeVillageActivity,
  drawGacha,
  GACHA_COST,
  GACHA_POOL,
  getVillageProgress,
  initialGameState,
  isVillageActivityReady,
  pickGachaItem,
  placeItem,
  unplaceItem,
  VILLAGE_ACTIVITIES,
} from './state.ts';

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

test('구매한 아이템은 빈 자리에 배치할 수 있다', () => {
  const owned = buyItem(initialGameState, {
    itemId: 'cloud-swing',
    itemName: '구름 그네',
    cost: 10,
    transactionId: 'buy-test-3',
    createdAt: '2026-08-25T10:00:00.000Z',
  });
  const placed = placeItem(owned, { itemId: 'cloud-swing', slotId: 'slot-1' });

  assert.deepEqual(placed.placements, [{ itemId: 'cloud-swing', slotId: 'slot-1' }]);
});

test('구매하지 않은 아이템은 배치할 수 없다', () => {
  assert.throws(() => placeItem(initialGameState, { itemId: 'cloud-swing', slotId: 'slot-1' }), /구매/);
});

test('이미 아이템이 놓인 자리에는 다시 놓을 수 없다', () => {
  const owned = buyItem(initialGameState, {
    itemId: 'cloud-swing',
    itemName: '구름 그네',
    cost: 10,
    transactionId: 'buy-test-4',
    createdAt: '2026-08-25T10:00:00.000Z',
  });
  const twiceOwned = buyItem(owned, {
    itemId: 'star-lamp',
    itemName: '별빛 램프',
    cost: 12,
    transactionId: 'buy-test-5',
    createdAt: '2026-08-25T10:00:00.000Z',
  });
  const placed = placeItem(twiceOwned, { itemId: 'cloud-swing', slotId: 'slot-1' });

  assert.throws(() => placeItem(placed, { itemId: 'star-lamp', slotId: 'slot-1' }), /놓여/);
});

test('배치된 아이템은 자리에서 치울 수 있다', () => {
  const owned = buyItem(initialGameState, {
    itemId: 'cloud-swing',
    itemName: '구름 그네',
    cost: 10,
    transactionId: 'buy-test-6',
    createdAt: '2026-08-25T10:00:00.000Z',
  });
  const placed = placeItem(owned, { itemId: 'cloud-swing', slotId: 'slot-1' });
  const removed = unplaceItem(placed, { slotId: 'slot-1' });

  assert.deepEqual(removed.placements, []);
});

test('마을 생활 매너 활동을 실천하면 토큰과 별빛을 얻는다', () => {
  const next = completeVillageActivity(initialGameState, {
    activityId: 'greet-neighbor',
    transactionId: 'activity-test-1',
    createdAt: '2026-08-25T10:00:00.000Z',
  });

  assert.equal(next.tokenBalance, 25);
  assert.equal(next.starlight, 330);
  assert.equal(next.activityLog['greet-neighbor'], '2026-08-25T10:00:00.000Z');
  assert.equal(next.transactions[0].reason, '이웃과 인사하기 실천');
});

test('마을일 돕기도 매너 활동과 같은 방식으로 토큰을 준다', () => {
  const next = completeVillageActivity(initialGameState, {
    activityId: 'water-garden',
    transactionId: 'activity-test-chore-1',
    createdAt: '2026-08-25T10:00:00.000Z',
  });

  assert.equal(next.tokenBalance, 25);
  assert.equal(next.starlight, 330);
  assert.equal(next.transactions[0].reason, '구름정원 물주기 돕기 실천');
  assert.equal(
    VILLAGE_ACTIVITIES.find((activity) => activity.id === 'water-garden')?.category,
    'chore',
  );
});

test('같은 매너 활동은 쿨다운 전에 다시 실천할 수 없다', () => {
  const next = completeVillageActivity(initialGameState, {
    activityId: 'greet-neighbor',
    transactionId: 'activity-test-2',
    createdAt: '2026-08-25T10:00:00.000Z',
  });

  assert.throws(
    () =>
      completeVillageActivity(next, {
        activityId: 'greet-neighbor',
        transactionId: 'activity-test-3',
        createdAt: '2026-08-25T20:00:00.000Z',
      }),
    /이미/,
  );

  assert.doesNotThrow(() =>
    completeVillageActivity(next, {
      activityId: 'greet-neighbor',
      transactionId: 'activity-test-4',
      createdAt: '2026-08-26T06:00:00.000Z',
    }),
  );
});

test('알 수 없는 마을 생활 활동은 실천할 수 없다', () => {
  assert.throws(
    () =>
      completeVillageActivity(initialGameState, {
        activityId: 'unknown-activity',
        transactionId: 'activity-test-5',
        createdAt: '2026-08-25T10:00:00.000Z',
      }),
    /알 수 없는/,
  );
});

test('isVillageActivityReady는 쿨다운 경과 여부를 정확히 반환한다', () => {
  const next = completeVillageActivity(initialGameState, {
    activityId: 'say-thanks',
    transactionId: 'activity-test-6',
    createdAt: '2026-08-25T10:00:00.000Z',
  });

  assert.equal(isVillageActivityReady(next, 'say-thanks', new Date('2026-08-25T20:00:00.000Z')), false);
  assert.equal(isVillageActivityReady(next, 'say-thanks', new Date('2026-08-26T06:00:00.000Z')), true);
});

test('pickGachaItem은 확률 가중치 구간에 맞는 아이템을 고른다', () => {
  const totalWeight = GACHA_POOL.reduce((sum, item) => sum + item.weight, 0);
  let cumulative = 0;

  for (const item of GACHA_POOL) {
    const midpointRandom = (cumulative + item.weight / 2) / totalWeight;
    assert.equal(pickGachaItem(midpointRandom).id, item.id);
    cumulative += item.weight;
  }

  assert.equal(pickGachaItem(0).id, GACHA_POOL[0].id);
  assert.equal(pickGachaItem(0.999999).id, GACHA_POOL[GACHA_POOL.length - 1].id);
});

test('뽑기는 토큰을 차감하고 새 아이템을 보유 목록에 추가한다', () => {
  const next = drawGacha(initialGameState, {
    itemId: 'star-hairpin',
    transactionId: 'gacha-test-1',
    createdAt: '2026-08-25T10:00:00.000Z',
  });

  assert.equal(next.tokenBalance, initialGameState.tokenBalance - GACHA_COST);
  assert.deepEqual(next.ownedGachaItemIds, ['star-hairpin']);
  assert.equal(next.gachaDraws[0].isDuplicate, false);
});

test('이미 가진 아이템이 다시 나오면 토큰 일부를 돌려받는다', () => {
  const first = drawGacha(initialGameState, {
    itemId: 'star-hairpin',
    transactionId: 'gacha-test-2',
    createdAt: '2026-08-25T10:00:00.000Z',
  });
  const second = drawGacha(first, {
    itemId: 'star-hairpin',
    transactionId: 'gacha-test-3',
    createdAt: '2026-08-25T10:05:00.000Z',
  });

  const refund = Math.ceil(GACHA_COST / 2);
  assert.equal(second.tokenBalance, first.tokenBalance - (GACHA_COST - refund));
  assert.deepEqual(second.ownedGachaItemIds, ['star-hairpin']);
  assert.equal(second.gachaDraws[0].isDuplicate, true);
});

test('칭찬 토큰이 부족하면 뽑기를 할 수 없다', () => {
  const brokeState = { ...initialGameState, tokenBalance: GACHA_COST - 1 };

  assert.throws(
    () => drawGacha(brokeState, { itemId: 'star-hairpin', transactionId: 'gacha-test-4', createdAt: '2026-08-25T10:00:00.000Z' }),
    /부족/,
  );
});

test('알 수 없는 뽑기 아이템은 뽑을 수 없다', () => {
  assert.throws(
    () => drawGacha(initialGameState, { itemId: 'unknown-item', transactionId: 'gacha-test-5', createdAt: '2026-08-25T10:00:00.000Z' }),
    /알 수 없는/,
  );
});
