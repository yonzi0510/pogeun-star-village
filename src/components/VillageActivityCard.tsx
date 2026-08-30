'use client';

import type { VillageActivity } from '../game/village';

type Props = {
  activities: VillageActivity[];
  isReady: (activityId: string) => boolean;
  onComplete: (activity: VillageActivity) => void;
};

const GROUPS: Array<{ category: VillageActivity['category']; label: string }> = [
  { category: 'manner', label: '이웃과 지내는 매너' },
  { category: 'chore', label: '마을일 돕기' },
];

// "오늘의 마을 생활": 매너 활동과 마을일 돕기를 한 카드 안에 작고 정돈된 버튼으로 모은다.
export function VillageActivityCard({ activities, isReady, onComplete }: Props) {
  return (
    <div className="mini-card activity-card">
      <p className="mini-card-title">오늘의 마을 생활 💛</p>
      {GROUPS.map((group) => (
        <div key={group.category} className="activity-group">
          <small>{group.label}</small>
          <div className="activity-row">
            {activities.filter((activity) => activity.category === group.category).map((activity) => {
              const ready = isReady(activity.id);
              return (
                <button
                  key={activity.id}
                  className={`activity-chip ${ready ? '' : 'done'}`}
                  onClick={() => onComplete(activity)}
                  aria-label={`${activity.name}${ready ? '' : ' (오늘 완료)'}`}
                  title={activity.name}
                >
                  <span>{activity.emoji}</span>
                  {!ready && <i aria-hidden="true">✓</i>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
