'use client';

import type { PointerEvent } from 'react';

export type VillageResident = {
  name: string;
  sprite: string;
  color: string;
  activity: string;
};

export type VillageBuildingHit = {
  key: string;
  hitClassName: string;
  ariaLabel: string;
  onEnter: () => void;
};

type Props = {
  mapSrc: string;
  mapAlt: string;
  residents: VillageResident[];
  positions: { x: number; y: number }[];
  playerIndex: number;
  selected: string;
  walking: boolean;
  buildings: VillageBuildingHit[];
  onMovePlayer: (event: PointerEvent<HTMLDivElement>) => void;
  onSelectPlayer: () => void;
  onTalkTo: (name: string, index: number, activity: string) => void;
};

// 마을 지도는 배경 그림 한 장 위에 문(건물), 걸어 다니는 주민들, 선택된 주민의 말풍선을
// 레이어로 겹쳐 그린다. positions/onTalkTo는 이미 있던 로직을 그대로 사용하고,
// 이번에 빠져 있던 "주민 4명 모두 지도 위에 서 있기"와 "말풍선 표시"만 새로 연결한다.
export function VillageScene({
  mapSrc,
  mapAlt,
  residents,
  positions,
  playerIndex,
  selected,
  walking,
  buildings,
  onMovePlayer,
  onSelectPlayer,
  onTalkTo,
}: Props) {
  const focusedResident = residents.find((entry) => entry.name === selected) ?? residents[playerIndex]!;

  return (
    <section className="home-grid">
      <div className="village-card illustrated">
        <img src={mapSrc} alt={mapAlt} />
        <div
          className="map-walk-layer"
          onPointerDown={onMovePlayer}
          role="application"
          aria-label="눌러서 모모몽을 이동시키는 마을 지도"
        />
        {buildings.map((building) => (
          <button
            key={building.key}
            className={`map-hit door-hit ${building.hitClassName}`}
            aria-label={building.ariaLabel}
            onClick={building.onEnter}
          />
        ))}
        <div className="moving-layer">
          {residents.map((entry, index) => {
            const position = positions[index] ?? { x: 50, y: 65 };
            const isPlayer = index === playerIndex;
            const isSelected = selected === entry.name;
            return (
              <button
                key={entry.name}
                className={[
                  'moving-character',
                  isPlayer ? 'player' : 'npc',
                  isPlayer && walking ? 'walking' : '',
                  isSelected ? 'selected' : '',
                ].filter(Boolean).join(' ')}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (isPlayer) onSelectPlayer();
                  else onTalkTo(entry.name, index, entry.activity);
                }}
                aria-label={isPlayer ? '내 캐릭터 모모몽' : `${entry.name}에게 다가가기`}
                aria-pressed={isSelected}
              >
                <img src={entry.sprite} alt="" />
                <span>{isPlayer ? '내 모모몽' : entry.name}</span>
              </button>
            );
          })}
        </div>
        <div className="speech" role="status">
          <strong>{focusedResident.name}</strong>
          <span>{focusedResident.activity}</span>
        </div>
      </div>
    </section>
  );
}
