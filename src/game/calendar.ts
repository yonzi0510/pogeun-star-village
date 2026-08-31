// 날짜에 맞춰 마을에 가벼운 축제 배너를 띄우는 순수 함수. 새 경제/보상은 만들지 않는다.

export type SeasonalEvent = {
  id: string;
  name: string;
  emoji: string;
  message: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
};

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  { id: 'spring-flower', name: '봄맞이 꽃축제', emoji: '🌸', message: '마을 곳곳에 벚꽃이 피었어요!', startMonth: 3, startDay: 20, endMonth: 4, endDay: 20 },
  { id: 'summer-star', name: '여름 별빛축제', emoji: '🎆', message: '밤하늘에 별빛이 쏟아지는 계절이에요!', startMonth: 7, startDay: 20, endMonth: 8, endDay: 20 },
  { id: 'autumn-harvest', name: '가을 수확제', emoji: '🍁', message: '마을에 단풍과 열매가 가득해요!', startMonth: 10, startDay: 1, endMonth: 10, endDay: 31 },
  { id: 'winter-snow', name: '겨울 눈꽃축제', emoji: '❄️', message: '하얀 눈이 마을을 포근하게 덮었어요!', startMonth: 12, startDay: 15, endMonth: 12, endDay: 31 },
];

function isWithinRange(month: number, day: number, event: SeasonalEvent): boolean {
  const value = month * 100 + day;
  const start = event.startMonth * 100 + event.startDay;
  const end = event.endMonth * 100 + event.endDay;
  return value >= start && value <= end;
}

// date가 null이면(마운트 전, 즉 서버 렌더링 시점) 배너를 띄우지 않는다 — 서버와
// 클라이언트의 new Date()가 어긋나 hydration mismatch가 나는 것을 막기 위함이다.
export function getActiveSeasonalEvent(date: Date | null): SeasonalEvent | null {
  if (!date) return null;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return SEASONAL_EVENTS.find((event) => isWithinRange(month, day, event)) ?? null;
}
