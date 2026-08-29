import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors, shadow } from './src/theme';
import { getActiveSeasonalEvent } from './src/game/calendar';
import { getResidentActivity } from './src/game/schedule';
import {
  GACHA_COST,
  GACHA_POOL,
  gameReducer,
  getVillageProgress,
  initialGameState,
  isVillageActivityReady,
  pickGachaItem,
  VILLAGE_ACTIVITIES,
} from './src/game/state';

type Tab = '마을' | '친구' | '꾸미기' | '앨범';

const residents = [
  { name: '포포', emoji: '🐑', color: '#DDF5E8' },
  { name: '모모몽', emoji: '🐰', color: '#FFE7D2' },
  { name: '두리콩', emoji: '🐶', color: '#FFF0C2' },
  { name: '루루별', emoji: '🐱', color: '#E9E1FF' },
];

const VILLAGE_SLOTS = [
  { id: 'slot-1', label: '왼쪽 뜰' },
  { id: 'slot-2', label: '가운데 뜰' },
  { id: 'slot-3', label: '오른쪽 뜰' },
];

const VILLAGE_ACTIVITY_GROUPS: Array<{ category: 'manner' | 'chore'; label: string }> = [
  { category: 'manner', label: '이웃과 지내는 매너' },
  { category: 'chore', label: '마을일 돕기' },
];

const tabs: Array<{ label: Tab; emoji: string }> = [
  { label: '마을', emoji: '🏡' },
  { label: '친구', emoji: '🐰' },
  { label: '꾸미기', emoji: '🖌️' },
  { label: '앨범', emoji: '📖' },
];

const buildings = [
  { label: '모모몽의 집', emoji: '🏡', tint: '#FFF0C2' },
  { label: '구름정원', emoji: '🌳', tint: '#DDF6D9' },
  { label: '별빛우체국', emoji: '📮', tint: '#E5E3FF' },
];

const decorationItems = [
  { id: 'cloud-swing', name: '구름 그네', emoji: '☁️', cost: 10, color: '#E8F6FF' },
  { id: 'star-lamp', name: '별빛 램프', emoji: '🌟', cost: 12, color: '#FFF2C7' },
  { id: 'ribbon-sofa', name: '리본 소파', emoji: '🎀', cost: 15, color: '#FFE2EC' },
  { id: 'flower-table', name: '꽃잎 탁자', emoji: '🌼', cost: 8, color: '#E7F7DF' },
];

function StatPill({ emoji, label, value }: { emoji: string; label: string; value: number }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

function Building({ emoji, label, tint }: { emoji: string; label: string; tint: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => Alert.alert(label, '주민들의 새로운 이야기가 곧 열려요!')}
      style={({ pressed }) => [styles.building, { backgroundColor: tint }, pressed && styles.pressed]}
    >
      <Text style={styles.buildingEmoji}>{emoji}</Text>
      <Text style={styles.buildingLabel}>{label}</Text>
    </Pressable>
  );
}

function LockedBuilding({ nextStageName }: { nextStageName: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => Alert.alert('아직 구름에 가려져 있어요', `별빛을 더 모으면 ${nextStageName} 구역에서 만날 수 있어요!`)}
      style={({ pressed }) => [styles.building, styles.buildingLocked, pressed && styles.pressed]}
    >
      <Text style={styles.buildingEmoji}>☁️</Text>
      <Text style={styles.buildingLockIcon}>🔒</Text>
    </Pressable>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('마을');
  const [selectedResident, setSelectedResident] = useState('모모몽');
  const [pickerSlot, setPickerSlot] = useState<string | null>(null);
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isWideLayout = width >= 900 && width > height;

  const seasonalEvent = useMemo(() => getActiveSeasonalEvent(), []);

  const currentResident = useMemo(
    () => residents.find((resident) => resident.name === selectedResident) ?? residents[1]!,
    [selectedResident],
  );
  const recentPraise = gameState.praiseEvents[0]!;

  const villageProgress = useMemo(() => getVillageProgress(gameState.starlight), [gameState.starlight]);
  const unlockedResidents = villageProgress.stage.unlockedResidents;
  const unlockedBuildings = villageProgress.stage.unlockedBuildings;

  const previousStageIndexRef = useRef(villageProgress.stageIndex);
  useEffect(() => {
    if (villageProgress.stageIndex > previousStageIndexRef.current) {
      Alert.alert('마을이 성장했어요! 🎉', `${villageProgress.stage.name} 구역이 열렸어요!`);
    }
    previousStageIndexRef.current = villageProgress.stageIndex;
  }, [villageProgress.stageIndex, villageProgress.stage.name]);

  const purchaseItem = (item: (typeof decorationItems)[number]) => {
    if (gameState.ownedItemIds.includes(item.id)) {
      Alert.alert(item.name, '이미 우리 마을에 있는 아이템이에요!');
      return;
    }
    if (gameState.tokenBalance < item.cost) {
      Alert.alert('토큰이 부족해요', `이 아이템에는 칭찬 토큰 ${item.cost}개가 필요해요.`);
      return;
    }
    dispatch({
      type: 'BUY_ITEM',
      itemId: item.id,
      itemName: item.name,
      cost: item.cost,
      transactionId: `buy-${item.id}`,
      createdAt: new Date().toISOString(),
    });
  };

  const unplacedOwnedItems = decorationItems.filter(
    (item) => gameState.ownedItemIds.includes(item.id) && !gameState.placements.some((p) => p.itemId === item.id),
  );

  const handleSlotPress = (slotId: string) => {
    const placement = gameState.placements.find((p) => p.slotId === slotId);
    const placedItem = placement ? decorationItems.find((item) => item.id === placement.itemId) : undefined;

    if (placedItem) {
      Alert.alert(placedItem.name, '이 자리에서 치울까요?', [
        { text: '취소', style: 'cancel' },
        { text: '치우기', style: 'destructive', onPress: () => dispatch({ type: 'UNPLACE_ITEM', slotId }) },
      ]);
      return;
    }
    setPickerSlot(slotId);
  };

  const placeItemInPickerSlot = (itemId: string) => {
    if (pickerSlot) {
      dispatch({ type: 'PLACE_ITEM', itemId, slotId: pickerSlot });
    }
    setPickerSlot(null);
  };

  const completeVillageActivityAction = (activity: (typeof VILLAGE_ACTIVITIES)[number]) => {
    if (!isVillageActivityReady(gameState, activity.id)) {
      Alert.alert('오늘은 이미 실천했어요', '내일 다시 실천해봐요!');
      return;
    }
    dispatch({
      type: 'COMPLETE_VILLAGE_ACTIVITY',
      activityId: activity.id,
      transactionId: `activity-${activity.id}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    Alert.alert('참 잘했어요! 🌟', `${activity.name}을(를) 실천해서 칭찬 토큰 +${activity.tokens}을 받았어요.`);
  };

  const handleDrawGacha = () => {
    if (gameState.tokenBalance < GACHA_COST) {
      Alert.alert('토큰이 부족해요', `별씨앗 뽑기에는 칭찬 토큰 ${GACHA_COST}개가 필요해요.`);
      return;
    }
    const item = pickGachaItem(Math.random());
    const isDuplicate = gameState.ownedGachaItemIds.includes(item.id);
    dispatch({
      type: 'DRAW_GACHA',
      itemId: item.id,
      transactionId: `gacha-${item.id}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
    Alert.alert(
      isDuplicate ? `${item.emoji} 또 만났어요!` : `${item.emoji} 짠! 새 친구가 왔어요!`,
      isDuplicate
        ? `${item.name}을(를) 또 뽑았어요. 겹치는 아이템이라 토큰을 조금 돌려받았어요.`
        : `${item.name}을(를) 처음 만났어요!`,
    );
  };

  const praisePanel = (
    <View style={styles.praiseCard}>
      <View style={styles.praiseIcon}><Text style={styles.praiseIconText}>💌</Text></View>
      <View style={styles.praiseCopy}>
        <Text style={styles.praiseTitle}>오늘 받은 따뜻한 칭찬</Text>
        <Text style={styles.praiseText}>“{recentPraise.message}”</Text>
      </View>
      <Text style={styles.plusToken}>+3</Text>
    </View>
  );

  const villagePanel = (
    <View style={[styles.villageCard, isWideLayout && styles.villageCardWide]}>
      <View style={[styles.cloud, styles.cloudLeft]}><Text style={styles.cloudText}>☁️</Text></View>
      <View style={[styles.cloud, styles.cloudRight]}><Text style={styles.cloudText}>☁️</Text></View>
      <Text style={styles.areaBadge}>{villageProgress.stage.name} · {villageProgress.stageIndex + 1}단계</Text>
      <Text style={[styles.villageTitle, isTablet && styles.villageTitleTablet]}>우리 마을이 자라고 있어요!</Text>

      {seasonalEvent && (
        <View style={styles.seasonalBanner}>
          <Text style={styles.seasonalEmoji}>{seasonalEvent.emoji}</Text>
          <View style={styles.seasonalCopy}>
            <Text style={styles.seasonalName}>{seasonalEvent.name}</Text>
            <Text style={styles.seasonalMessage}>{seasonalEvent.message}</Text>
          </View>
        </View>
      )}

      <View style={[styles.buildingsRow, isTablet && styles.buildingsRowTablet]}>
        {buildings.map((item) =>
          unlockedBuildings.includes(item.label) ? (
            <Building key={item.label} emoji={item.emoji} label={item.label} tint={item.tint} />
          ) : (
            <LockedBuilding key={item.label} nextStageName={villageProgress.nextStage?.name ?? '다음'} />
          ),
        )}
      </View>

      <View style={[styles.plaza, isTablet && styles.plazaTablet]}>
        {residents.map((resident) => {
          const unlocked = unlockedResidents.includes(resident.name);
          if (!unlocked) {
            return (
              <Pressable
                key={resident.name}
                onPress={() =>
                  Alert.alert('아직 만나지 못한 주민이에요', `별빛을 더 모으면 ${resident.name}을(를) 만날 수 있어요!`)
                }
                style={[styles.resident, isTablet && styles.residentTablet, styles.residentLocked]}
              >
                <Text style={[styles.residentEmoji, isTablet && styles.residentEmojiTablet]}>❓</Text>
              </Pressable>
            );
          }
          return (
            <Pressable
              key={resident.name}
              onPress={() => setSelectedResident(resident.name)}
              style={({ pressed }) => [
                styles.resident,
                isTablet && styles.residentTablet,
                { backgroundColor: resident.color },
                selectedResident === resident.name && styles.residentSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.residentEmoji, isTablet && styles.residentEmojiTablet]}>{resident.emoji}</Text>
              <Text style={styles.residentName}>{resident.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.speechBubble}>
        <Text style={styles.speechName}>{currentResident.name}</Text>
        <Text style={styles.speechText}>{getResidentActivity(currentResident.name)}</Text>
      </View>

      <View style={[styles.slotsRow, isTablet && styles.slotsRowTablet]}>
        {VILLAGE_SLOTS.map((slot) => {
          const placement = gameState.placements.find((p) => p.slotId === slot.id);
          const item = placement ? decorationItems.find((d) => d.id === placement.itemId) : undefined;
          return (
            <Pressable
              key={slot.id}
              onPress={() => handleSlotPress(slot.id)}
              style={({ pressed }) => [
                styles.slot,
                item ? { backgroundColor: item.color } : styles.slotEmpty,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.slotEmoji}>{item ? item.emoji : '➕'}</Text>
              <Text style={styles.slotLabel}>{item ? item.name : slot.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const etiquettePanel = (
    <View style={styles.etiquetteCard}>
      <Text style={styles.etiquetteTitle}>오늘의 마을 생활 💛</Text>
      <Text style={styles.etiquetteSubtitle}>매너를 실천하거나 마을일을 도우면 토큰을 받아요.</Text>
      {VILLAGE_ACTIVITY_GROUPS.map((group) => (
        <View key={group.category} style={styles.etiquetteGroup}>
          <Text style={styles.etiquetteGroupLabel}>{group.label}</Text>
          <View style={styles.etiquetteRow}>
            {VILLAGE_ACTIVITIES.filter((activity) => activity.category === group.category).map((activity) => {
              const ready = isVillageActivityReady(gameState, activity.id);
              return (
                <Pressable
                  key={activity.id}
                  onPress={() => completeVillageActivityAction(activity)}
                  style={({ pressed }) => [
                    styles.etiquetteButton,
                    !ready && styles.etiquetteButtonDone,
                    pressed && ready && styles.pressed,
                  ]}
                >
                  <Text style={styles.etiquetteEmoji}>{activity.emoji}</Text>
                  <Text style={styles.etiquetteName}>{activity.name}</Text>
                  <Text style={styles.etiquetteStatus}>{ready ? `⭐ +${activity.tokens}` : '오늘 완료!'}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );

  const progressPanel = (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>{villageProgress.nextStage ? '다음 구역까지' : '최고 단계 달성'}</Text>
        <Text style={styles.progressValue}>
          {villageProgress.nextThreshold !== null
            ? `${gameState.starlight} / ${villageProgress.nextThreshold} 별빛`
            : `${gameState.starlight} 별빛`}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${villageProgress.progressToNext * 100}%` }]} />
      </View>
      <Text style={styles.progressHint}>
        {villageProgress.nextStage
          ? `별빛이 모이면 ${villageProgress.nextStage.name} 구역의 구름이 걷혀요.`
          : '지금까지 만든 모든 구역이 열렸어요! 새로운 이야기를 기대해주세요.'}
      </Text>
    </View>
  );

  const secondaryPanel = (
    <View style={styles.secondaryCard}>
      <Text style={styles.secondaryEyebrow}>포근별 마을</Text>
      <Text style={styles.secondaryTitle}>{activeTab}</Text>

      {activeTab === '친구' && (
        <View style={styles.friendGrid}>
          {residents.map((resident) => {
            const unlocked = unlockedResidents.includes(resident.name);
            if (!unlocked) {
              return (
                <Pressable
                  key={resident.name}
                  onPress={() =>
                    Alert.alert('아직 만나지 못한 주민이에요', `별빛을 더 모으면 ${resident.name}을(를) 만날 수 있어요!`)
                  }
                  style={[styles.friendCard, styles.friendCardLocked]}
                >
                  <Text style={styles.friendEmoji}>❓</Text>
                  <Text style={styles.friendActivity}>별빛을 더 모으면 만나요</Text>
                </Pressable>
              );
            }
            const activity = getResidentActivity(resident.name);
            return (
              <Pressable
                key={resident.name}
                onPress={() => Alert.alert(resident.name, activity)}
                style={({ pressed }) => [styles.friendCard, { backgroundColor: resident.color }, pressed && styles.pressed]}
              >
                <Text style={styles.friendEmoji}>{resident.emoji}</Text>
                <Text style={styles.friendName}>{resident.name}</Text>
                <Text style={styles.friendActivity}>{activity}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {activeTab === '꾸미기' && (
        <>
          <View style={styles.gachaCard}>
            <Text style={styles.gachaTitle}>별씨앗 뽑기 🌠</Text>
            <Text style={styles.gachaSubtitle}>
              칭찬 토큰 {GACHA_COST}개로 별씨앗을 심으면 의상·장난감 친구를 만나요.
            </Text>
            <Pressable
              onPress={handleDrawGacha}
              style={({ pressed }) => [styles.gachaButton, pressed && styles.pressed]}
            >
              <Text style={styles.gachaButtonText}>⭐ {GACHA_COST}개로 별씨앗 심기</Text>
            </Pressable>
            <View style={styles.gachaGrid}>
              {GACHA_POOL.map((item) => {
                const owned = gameState.ownedGachaItemIds.includes(item.id);
                const percent = Math.round(
                  (item.weight / GACHA_POOL.reduce((sum, poolItem) => sum + poolItem.weight, 0)) * 100,
                );
                return (
                  <View
                    key={item.id}
                    style={[styles.gachaItem, { backgroundColor: owned ? item.color : '#EFEFEF' }]}
                  >
                    <Text style={styles.gachaItemEmoji}>{owned ? item.emoji : '❓'}</Text>
                    <Text style={styles.gachaItemName}>{owned ? item.name : '???'}</Text>
                    <Text style={styles.gachaItemFreq}>{item.frequency} · {percent}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
          <Text style={styles.itemGridTitle}>가구 꾸미기</Text>
          <View style={styles.itemGrid}>
            {decorationItems.map((item) => {
              const owned = gameState.ownedItemIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => purchaseItem(item)}
                  style={({ pressed }) => [styles.itemCard, { backgroundColor: item.color }, pressed && styles.pressed]}
                >
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={[styles.itemCost, owned && styles.itemOwned]}>{owned ? '보유 중' : `⭐ ${item.cost}`}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {activeTab === '앨범' && (
        <View style={styles.albumList}>
          {gameState.praiseEvents.map((event) => (
            <View key={event.id} style={styles.albumEntry}>
              <View style={styles.albumIcon}><Text style={styles.albumIconText}>💌</Text></View>
              <View style={styles.albumCopy}>
                <Text style={styles.albumCategory}>{event.category} 칭찬</Text>
                <Text style={styles.albumMessage}>{event.message}</Text>
              </View>
              <Text style={styles.albumTokens}>+{event.tokens}</Text>
            </View>
          ))}
          <Text style={styles.ledgerTitle}>최근 토큰 기록</Text>
          {gameState.transactions.slice(0, 5).map((transaction) => (
            <View key={transaction.id} style={styles.ledgerRow}>
              <Text style={styles.ledgerReason}>{transaction.reason}</Text>
              <Text style={transaction.kind === 'earn' ? styles.ledgerEarn : styles.ledgerSpend}>
                {transaction.kind === 'earn' ? '+' : '-'}{transaction.amount}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.sky} />
      <View style={styles.app}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isTablet && styles.scrollContentTablet]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pageShell}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>칭찬이 별빛이 되는 곳</Text>
              <Text style={styles.title}>포근별 마을 ✨</Text>
            </View>
            <Pressable
              accessibilityLabel="알림"
              onPress={() => Alert.alert('새 소식', '두리콩이 칭찬 편지를 가져왔어요!')}
              style={styles.iconButton}
            >
              <Text style={styles.iconText}>🔔</Text>
            </Pressable>
          </View>

          <View style={[styles.statsRow, isTablet && styles.statsRowTablet]}>
            <StatPill emoji="⭐" label="칭찬 토큰" value={gameState.tokenBalance} />
            <StatPill emoji="💫" label="별빛" value={gameState.starlight} />
          </View>

          {activeTab !== '마을' ? secondaryPanel : isWideLayout ? (
            <View style={styles.wideBody}>
              <View style={styles.villagePane}>{villagePanel}</View>
              <View style={styles.sidePane}>
                {praisePanel}
                {etiquettePanel}
                {progressPanel}
                <View style={styles.tabletNote}>
                  <Text style={styles.tabletNoteEmoji}>🌈</Text>
                  <Text style={styles.tabletNoteTitle}>태블릿에서 더 넓게!</Text>
                  <Text style={styles.tabletNoteText}>마을을 한눈에 보고 주민과 건물을 편하게 눌러보세요.</Text>
                </View>
              </View>
            </View>
          ) : (
            <>
              {praisePanel}
              {etiquettePanel}
              {villagePanel}
              {progressPanel}
            </>
          )}
          </View>
        </ScrollView>

        <View style={[styles.tabBar, isTablet && styles.tabBarTablet]}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === tab.label }}
              onPress={() => setActiveTab(tab.label)}
              style={[styles.tab, activeTab === tab.label && styles.activeTab]}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.label && styles.activeTabLabel]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Modal visible={pickerSlot !== null} transparent animationType="fade" onRequestClose={() => setPickerSlot(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>이 자리에 놓을 아이템을 골라요</Text>
            {unplacedOwnedItems.length === 0 ? (
              <Text style={styles.modalEmpty}>꾸미기 탭에서 아이템을 먼저 구매해보세요!</Text>
            ) : (
              <View style={styles.modalGrid}>
                {unplacedOwnedItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => placeItemInPickerSlot(item.id)}
                    style={({ pressed }) => [styles.modalItem, { backgroundColor: item.color }, pressed && styles.pressed]}
                  >
                    <Text style={styles.modalItemEmoji}>{item.emoji}</Text>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Pressable onPress={() => setPickerSlot(null)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.sky },
  app: { flex: 1, backgroundColor: colors.cream },
  scrollContent: { padding: 18, paddingBottom: 28 },
  scrollContentTablet: { padding: 24, paddingBottom: 34 },
  pageShell: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  eyebrow: { color: colors.muted, fontSize: 12, fontWeight: '700', marginBottom: 3 },
  title: { color: colors.cocoa, fontSize: 26, fontWeight: '900', letterSpacing: -0.6 },
  iconButton: { width: 46, height: 46, borderRadius: 17, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', ...shadow },
  iconText: { fontSize: 22 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statsRowTablet: { maxWidth: 460, alignSelf: 'flex-end', width: '100%' },
  statPill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.paper, borderRadius: 22, paddingVertical: 11, paddingHorizontal: 14, borderWidth: 2, borderColor: '#F3E4CC', ...shadow },
  statEmoji: { fontSize: 25 },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  statValue: { color: colors.cocoa, fontSize: 18, lineHeight: 21, fontWeight: '900' },
  praiseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F2', borderColor: '#FFD2D9', borderWidth: 2, borderRadius: 22, padding: 13, marginBottom: 14 },
  praiseIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  praiseIconText: { fontSize: 23 },
  praiseCopy: { flex: 1 },
  praiseTitle: { color: '#B65B6A', fontSize: 12, fontWeight: '900', marginBottom: 2 },
  praiseText: { color: colors.cocoa, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  plusToken: { color: colors.pink, fontSize: 19, fontWeight: '900', marginLeft: 5 },
  villageCard: { minHeight: 455, overflow: 'hidden', backgroundColor: '#CFF2C8', borderRadius: 30, borderWidth: 3, borderColor: colors.white, padding: 16, ...shadow },
  villageCardWide: { minHeight: 620, padding: 24, justifyContent: 'space-between' },
  cloud: { position: 'absolute', opacity: 0.82 },
  cloudLeft: { top: 45, left: -27 },
  cloudRight: { top: 114, right: -35 },
  cloudText: { fontSize: 85 },
  areaBadge: { alignSelf: 'center', backgroundColor: '#FFFFFFD9', color: colors.muted, borderRadius: 14, paddingVertical: 5, paddingHorizontal: 11, fontSize: 11, fontWeight: '800', overflow: 'hidden' },
  villageTitle: { textAlign: 'center', color: '#477B50', fontSize: 19, fontWeight: '900', marginTop: 9, marginBottom: 15 },
  villageTitleTablet: { fontSize: 24, marginTop: 12, marginBottom: 20 },
  buildingsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  buildingsRowTablet: { gap: 14 },
  building: { flex: 1, minHeight: 92, borderRadius: 22, padding: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFFC7', ...shadow },
  buildingEmoji: { fontSize: 36 },
  buildingLabel: { marginTop: 3, color: colors.cocoa, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  buildingLocked: { backgroundColor: '#E7EEF5', opacity: 0.85 },
  buildingLockIcon: { position: 'absolute', bottom: 8, fontSize: 16 },
  plaza: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, backgroundColor: '#F5DFA8', borderColor: '#FFF4CF', borderWidth: 5, borderRadius: 80, paddingVertical: 20, paddingHorizontal: 12, marginTop: 18 },
  plazaTablet: { gap: 18, paddingVertical: 28, marginTop: 24 },
  resident: { width: 63, height: 76, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.white },
  residentTablet: { width: 82, height: 96, borderRadius: 36 },
  residentSelected: { transform: [{ translateY: -7 }], borderColor: colors.butter },
  residentLocked: { backgroundColor: '#E7EEF5', opacity: 0.7 },
  residentEmoji: { fontSize: 34 },
  residentEmojiTablet: { fontSize: 46 },
  residentName: { color: colors.cocoa, fontSize: 10, fontWeight: '900', marginTop: 2 },
  speechBubble: { backgroundColor: colors.paper, borderRadius: 17, paddingVertical: 10, paddingHorizontal: 14, marginTop: 13, alignSelf: 'center', minWidth: '82%', ...shadow },
  speechName: { textAlign: 'center', color: colors.pink, fontSize: 12, fontWeight: '900' },
  speechText: { textAlign: 'center', color: colors.cocoa, fontSize: 12, fontWeight: '700', marginTop: 2 },
  seasonalBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFFD9', borderRadius: 18, padding: 10, marginTop: 10 },
  seasonalEmoji: { fontSize: 26, marginRight: 8 },
  seasonalCopy: { flex: 1 },
  seasonalName: { color: colors.cocoa, fontSize: 12, fontWeight: '900' },
  seasonalMessage: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 1 },
  slotsRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  slotsRowTablet: { gap: 14, marginTop: 20 },
  slot: { flex: 1, minHeight: 76, borderRadius: 18, alignItems: 'center', justifyContent: 'center', padding: 6, borderWidth: 2, borderColor: '#FFFFFFC7', ...shadow },
  slotEmpty: { backgroundColor: '#FFFFFFA6', borderStyle: 'dashed' },
  slotEmoji: { fontSize: 26 },
  slotLabel: { marginTop: 2, color: colors.cocoa, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  etiquetteCard: { backgroundColor: colors.paper, borderRadius: 22, padding: 15, marginBottom: 14, borderWidth: 2, borderColor: '#F0E4D2' },
  etiquetteTitle: { color: colors.cocoa, fontWeight: '900', fontSize: 14, marginBottom: 3 },
  etiquetteSubtitle: { color: colors.muted, fontSize: 11, fontWeight: '700', marginBottom: 10 },
  etiquetteGroup: { marginBottom: 10 },
  etiquetteGroupLabel: { color: colors.muted, fontSize: 11, fontWeight: '900', marginBottom: 6 },
  etiquetteRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  etiquetteButton: { flexGrow: 1, flexBasis: '45%', backgroundColor: '#FFF6E2', borderRadius: 16, padding: 10, alignItems: 'center', borderWidth: 2, borderColor: '#FBE8BE' },
  etiquetteButtonDone: { backgroundColor: '#EFEFEF', borderColor: '#E1E1E1', opacity: 0.75 },
  etiquetteEmoji: { fontSize: 24 },
  etiquetteName: { color: colors.cocoa, fontSize: 11, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  etiquetteStatus: { color: colors.pink, fontSize: 11, fontWeight: '900', marginTop: 3 },
  progressCard: { backgroundColor: colors.paper, borderRadius: 22, padding: 15, marginTop: 14, borderWidth: 2, borderColor: '#F0E4D2' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { color: colors.cocoa, fontWeight: '900', fontSize: 14 },
  progressValue: { color: colors.lavender, fontWeight: '900', fontSize: 12 },
  progressTrack: { height: 13, borderRadius: 8, backgroundColor: '#ECE4F7', marginVertical: 9, overflow: 'hidden' },
  progressFill: { height: '100%', width: '64%', borderRadius: 8, backgroundColor: colors.lavender },
  progressHint: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  wideBody: { flexDirection: 'row', alignItems: 'stretch', gap: 20 },
  villagePane: { flex: 1.65, minWidth: 0 },
  sidePane: { flex: 0.85, minWidth: 300 },
  tabletNote: { backgroundColor: '#EEF7FF', borderColor: '#D3E8FA', borderWidth: 2, borderRadius: 22, padding: 18, marginTop: 14 },
  tabletNoteEmoji: { fontSize: 30, marginBottom: 8 },
  tabletNoteTitle: { color: colors.cocoa, fontSize: 16, fontWeight: '900', marginBottom: 5 },
  tabletNoteText: { color: colors.muted, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  secondaryCard: { minHeight: 500, backgroundColor: colors.paper, borderRadius: 30, borderWidth: 2, borderColor: '#F0E4D2', padding: 20, ...shadow },
  secondaryEyebrow: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  secondaryTitle: { color: colors.cocoa, fontSize: 26, fontWeight: '900', marginTop: 3, marginBottom: 18 },
  friendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  friendCard: { flexGrow: 1, flexBasis: 180, minHeight: 190, borderRadius: 26, alignItems: 'center', justifyContent: 'center', padding: 18, borderWidth: 3, borderColor: colors.white },
  friendCardLocked: { backgroundColor: '#E7EEF5', borderStyle: 'dashed' },
  friendEmoji: { fontSize: 60 },
  friendName: { color: colors.cocoa, fontSize: 18, fontWeight: '900', marginTop: 8 },
  friendActivity: { color: colors.muted, fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 5 },
  gachaCard: { backgroundColor: '#FFF6E2', borderRadius: 24, borderWidth: 2, borderColor: '#FBE8BE', padding: 16, marginBottom: 18 },
  gachaTitle: { color: colors.cocoa, fontSize: 16, fontWeight: '900', marginBottom: 3 },
  gachaSubtitle: { color: colors.muted, fontSize: 12, fontWeight: '700', marginBottom: 12 },
  gachaButton: { backgroundColor: colors.butter, borderRadius: 18, paddingVertical: 12, alignItems: 'center', ...shadow },
  gachaButtonText: { color: colors.cocoa, fontSize: 14, fontWeight: '900' },
  gachaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  gachaItem: { flexGrow: 1, flexBasis: '22%', minHeight: 90, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 6, borderWidth: 2, borderColor: colors.white },
  gachaItemEmoji: { fontSize: 26 },
  gachaItemName: { color: colors.cocoa, fontSize: 10, fontWeight: '800', marginTop: 3, textAlign: 'center' },
  gachaItemFreq: { color: colors.muted, fontSize: 9, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  itemGridTitle: { color: colors.cocoa, fontSize: 15, fontWeight: '900', marginBottom: 12 },
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  itemCard: { flexGrow: 1, flexBasis: 150, minHeight: 170, borderRadius: 25, alignItems: 'center', justifyContent: 'center', padding: 16, borderWidth: 3, borderColor: colors.white },
  itemEmoji: { fontSize: 52 },
  itemName: { color: colors.cocoa, fontSize: 15, fontWeight: '900', marginTop: 8 },
  itemCost: { color: '#B27634', fontSize: 13, fontWeight: '900', marginTop: 6 },
  itemOwned: { color: colors.grass },
  albumList: { gap: 10 },
  albumEntry: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF4F5', borderRadius: 20, padding: 14 },
  albumIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  albumIconText: { fontSize: 24 },
  albumCopy: { flex: 1 },
  albumCategory: { color: colors.pink, fontSize: 11, fontWeight: '900' },
  albumMessage: { color: colors.cocoa, fontSize: 13, fontWeight: '700', marginTop: 3 },
  albumTokens: { color: colors.pink, fontSize: 18, fontWeight: '900' },
  ledgerTitle: { color: colors.cocoa, fontSize: 17, fontWeight: '900', marginTop: 16, marginBottom: 2 },
  ledgerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EFE6D8', paddingVertical: 11 },
  ledgerReason: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  ledgerEarn: { color: colors.grass, fontSize: 14, fontWeight: '900' },
  ledgerSpend: { color: colors.pink, fontSize: 14, fontWeight: '900' },
  tabBar: { flexDirection: 'row', backgroundColor: colors.paper, borderTopColor: '#F0E4D2', borderTopWidth: 1, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10 },
  tabBarTablet: { alignSelf: 'center', width: '100%', maxWidth: 760, borderRadius: 24, borderWidth: 1, borderColor: '#F0E4D2', marginBottom: 12, paddingHorizontal: 18 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 5, borderRadius: 16 },
  activeTab: { backgroundColor: '#FFF0D4' },
  tabEmoji: { fontSize: 22 },
  tabLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', marginTop: 2 },
  activeTabLabel: { color: colors.cocoa, fontWeight: '900' },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
  modalOverlay: { flex: 1, backgroundColor: '#33261DAA', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: colors.paper, borderRadius: 26, padding: 20, ...shadow },
  modalTitle: { color: colors.cocoa, fontSize: 16, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  modalEmpty: { color: colors.muted, fontSize: 13, fontWeight: '700', textAlign: 'center', paddingVertical: 16 },
  modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  modalItem: { width: 96, minHeight: 96, borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 8, borderWidth: 2, borderColor: colors.white },
  modalItemEmoji: { fontSize: 32 },
  modalItemName: { color: colors.cocoa, fontSize: 11, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  modalClose: { marginTop: 16, alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 14, backgroundColor: '#F0E4D2' },
  modalCloseText: { color: colors.cocoa, fontWeight: '900', fontSize: 13 },
});
