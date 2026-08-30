'use client';

import type { VillageStage } from '../game/village';

type Props = {
  starlight: number;
  stage: VillageStage;
  nextStage: VillageStage | null;
  nextResidentHint: string | null;
};

// 단순 수치형 진행바보다 "다음 마을이 가까워지고 있다"는 느낌을 주는 것이 목적이라
// 현재 단계 이름과 다음 단계까지 남은 별빛, 다음에 만날 주민을 함께 보여준다.
export function VillageProgress({ starlight, stage, nextStage, nextResidentHint }: Props) {
  const progress = nextStage
    ? Math.min(1, Math.max(0, (starlight - stage.threshold) / (nextStage.threshold - stage.threshold)))
    : 1;

  return (
    <div className="mini-card growth-card">
      <div className="growth-header">
        <strong>{stage.name}</strong>
        <span>{nextStage ? `${nextStage.name}까지 별빛 ${Math.max(0, nextStage.threshold - starlight)}개` : '최고 단계 달성!'}</span>
      </div>
      <div className="growth-track"><i style={{ width: `${progress * 100}%` }} /></div>
      <p>{nextStage ? (nextResidentHint ?? '별빛이 모이면 다음 구역이 열려요.') : '지금까지 만든 모든 구역이 열렸어요!'}</p>
    </div>
  );
}
