export type DayPeriod = '아침' | '낮' | '저녁' | '밤';

export function getDayPeriod(date: Date): DayPeriod {
  const hour = date.getHours();
  if (hour >= 5 && hour < 10) return '아침';
  if (hour >= 10 && hour < 17) return '낮';
  if (hour >= 17 && hour < 21) return '저녁';
  return '밤';
}

export type ResidentSchedule = Record<DayPeriod, string>;

// 동물의 숲처럼 시간대에 따라 주민이 다른 일을 하며 살아있게 느껴지도록 합니다.
export const RESIDENT_SCHEDULES: Record<string, ResidentSchedule> = {
  모모몽: {
    아침: '광장에서 아침 체조를 하는 중',
    낮: '숨은 길을 탐험하는 중',
    저녁: '친구들과 오늘 있었던 일을 이야기하는 중',
    밤: '별빛 이불을 덮고 잠든 중',
  },
  포포: {
    아침: '구름정원에 물을 주는 중',
    낮: '쿠션과 담요를 정리하는 중',
    저녁: '따뜻한 차를 마시며 쉬는 중',
    밤: '포근하게 낮잠에 빠진 중',
  },
  두리콩: {
    아침: '오늘 배달할 편지를 챙기는 중',
    낮: '칭찬 편지를 배달하는 중',
    저녁: '모은 스티커를 정리하는 중',
    밤: '내일 배달을 준비하며 잠든 중',
  },
  루루별: {
    아침: '밤하늘공방을 청소하는 중',
    낮: '새로운 그림을 그리는 중',
    저녁: '반짝이는 별가루를 모으는 중',
    밤: '별빛 아래에서 꿈을 그리는 중',
  },
};

export function getResidentActivity(name: string, date: Date = new Date()): string {
  const period = getDayPeriod(date);
  return RESIDENT_SCHEDULES[name]?.[period] ?? '마을에서 지내는 중';
}
