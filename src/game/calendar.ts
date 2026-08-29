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

// 기획서의 "계절 행사" MVP 이전 버전: 날짜에 맞춰 마을에 가벼운 축제 배너를 띄웁니다.
export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: 'spring-flower',
    name: '봄맞이 꽃축제',
    emoji: '🌸',
    message: '마을 곳곳에 벚꽃이 피었어요!',
    startMonth: 3,
    startDay: 20,
    endMonth: 4,
    endDay: 20,
  },
  {
    id: 'summer-star',
    name: '여름 별빛축제',
    emoji: '🎆',
    message: '밤하늘에 별빛이 쏟아지는 계절이에요!',
    startMonth: 7,
    startDay: 20,
    endMonth: 8,
    endDay: 20,
  },
  {
    id: 'autumn-harvest',
    name: '가을 수확제',
    emoji: '🍁',
    message: '마을에 단풍과 열매가 가득해요!',
    startMonth: 10,
    startDay: 1,
    endMonth: 10,
    endDay: 31,
  },
  {
    id: 'winter-snow',
    name: '겨울 눈꽃축제',
    emoji: '❄️',
    message: '하얀 눈이 마을을 포근하게 덮었어요!',
    startMonth: 12,
    startDay: 15,
    endMonth: 12,
    endDay: 31,
  },
];

function isWithinRange(month: number, day: number, event: SeasonalEvent): boolean {
  const value = month * 100 + day;
  const start = event.startMonth * 100 + event.startDay;
  const end = event.endMonth * 100 + event.endDay;
  return value >= start && value <= end;
}

export function getActiveSeasonalEvent(date: Date = new Date()): SeasonalEvent | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return SEASONAL_EVENTS.find((event) => isWithinRange(month, day, event)) ?? null;
}
