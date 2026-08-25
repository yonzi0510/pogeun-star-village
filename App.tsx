import { useMemo, useReducer, useState } from 'react';
import {
  Alert,
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
import { gameReducer, initialGameState } from './src/game/state';

type Tab = '마을' | '친구' | '꾸미기' | '앨범';

const residents = [
  { name: '포포', emoji: '🐑', color: '#DDF5E8', activity: '구름정원에 물 주는 중' },
  { name: '모모몽', emoji: '🐰', color: '#FFE7D2', activity: '광장에서 기다리는 중' },
  { name: '두리콩', emoji: '🐶', color: '#FFF0C2', activity: '칭찬 편지를 배달하는 중' },
  { name: '루루별', emoji: '🐱', color: '#E9E1FF', activity: '별빛을 그리고 있는 중' },
];

const tabs: Array<{ label: Tab; emoji: string }> = [
  { label: '마을', emoji: '🏡' },
  { label: '친구', emoji: '🐰' },
  { label: '꾸미기', emoji: '🖌️' },
  { label: '앨범', emoji: '📖' },
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

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('마을');
  const [selectedResident, setSelectedResident] = useState('모모몽');
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isWideLayout = width >= 900 && width > height;

  const currentResident = useMemo(
    () => residents.find((resident) => resident.name === selectedResident) ?? residents[1]!,
    [selectedResident],
  );
  const recentPraise = gameState.praiseEvents[0]!;

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
      <Text style={styles.areaBadge}>작은 언덕 · 1단계</Text>
      <Text style={[styles.villageTitle, isTablet && styles.villageTitleTablet]}>우리 마을이 자라고 있어요!</Text>

      <View style={[styles.buildingsRow, isTablet && styles.buildingsRowTablet]}>
        <Building emoji="🌳" label="구름정원" tint="#DDF6D9" />
        <Building emoji="🏡" label="모모몽의 집" tint="#FFF0C2" />
        <Building emoji="📮" label="별빛우체국" tint="#E5E3FF" />
      </View>

      <View style={[styles.plaza, isTablet && styles.plazaTablet]}>
        {residents.map((resident) => (
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
        ))}
      </View>

      <View style={styles.speechBubble}>
        <Text style={styles.speechName}>{currentResident.name}</Text>
        <Text style={styles.speechText}>{currentResident.activity}</Text>
      </View>
    </View>
  );

  const progressPanel = (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>다음 구역까지</Text>
        <Text style={styles.progressValue}>320 / 500 별빛</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
      <Text style={styles.progressHint}>별빛이 모이면 포근한 이웃 구역의 구름이 걷혀요.</Text>
    </View>
  );

  const secondaryPanel = (
    <View style={styles.secondaryCard}>
      <Text style={styles.secondaryEyebrow}>포근별 마을</Text>
      <Text style={styles.secondaryTitle}>{activeTab}</Text>

      {activeTab === '친구' && (
        <View style={styles.friendGrid}>
          {residents.map((resident) => (
            <Pressable
              key={resident.name}
              onPress={() => Alert.alert(resident.name, resident.activity)}
              style={({ pressed }) => [styles.friendCard, { backgroundColor: resident.color }, pressed && styles.pressed]}
            >
              <Text style={styles.friendEmoji}>{resident.emoji}</Text>
              <Text style={styles.friendName}>{resident.name}</Text>
              <Text style={styles.friendActivity}>{resident.activity}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {activeTab === '꾸미기' && (
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
  plaza: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, backgroundColor: '#F5DFA8', borderColor: '#FFF4CF', borderWidth: 5, borderRadius: 80, paddingVertical: 20, paddingHorizontal: 12, marginTop: 18 },
  plazaTablet: { gap: 18, paddingVertical: 28, marginTop: 24 },
  resident: { width: 63, height: 76, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.white },
  residentTablet: { width: 82, height: 96, borderRadius: 36 },
  residentSelected: { transform: [{ translateY: -7 }], borderColor: colors.butter },
  residentEmoji: { fontSize: 34 },
  residentEmojiTablet: { fontSize: 46 },
  residentName: { color: colors.cocoa, fontSize: 10, fontWeight: '900', marginTop: 2 },
  speechBubble: { backgroundColor: colors.paper, borderRadius: 17, paddingVertical: 10, paddingHorizontal: 14, marginTop: 13, alignSelf: 'center', minWidth: '82%', ...shadow },
  speechName: { textAlign: 'center', color: colors.pink, fontSize: 12, fontWeight: '900' },
  speechText: { textAlign: 'center', color: colors.cocoa, fontSize: 12, fontWeight: '700', marginTop: 2 },
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
  friendEmoji: { fontSize: 60 },
  friendName: { color: colors.cocoa, fontSize: 18, fontWeight: '900', marginTop: 8 },
  friendActivity: { color: colors.muted, fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 5 },
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
});
