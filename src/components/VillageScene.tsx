'use client';

import type { PointerEvent } from 'react';
import { getResidentActivity } from '../game/schedule';
import type { SeasonalEvent } from '../game/calendar';

export type VillageResident = {
  name: string;
  sprite: string;
  color: string;
};

export type VillageBuildingHit = {
  key: string;
  hitClassName: string;
  ariaLabel: string;
  unlocked: boolean;
  onEnter: () => void;
};

export type VillageSocialNeighbor = {
  name: string;
  sprite: string;
  x: number;
  y: number;
  activityId: string;
  actionLabel: string;
  line: string;
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
  socialNeighbors: VillageSocialNeighbor[];
  unlockedResidents: string[];
  seasonalEvent: SeasonalEvent | null;
  now: Date | null;
  onMovePlayer: (event: PointerEvent<HTMLDivElement>) => void;
  onSelectPlayer: () => void;
  onTalkTo: (name: string, index: number) => void;
  onSocialize: (neighbor: VillageSocialNeighbor) => void;
  onLockedResident: (name: string) => void;
  onLockedBuilding: () => void;
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
  socialNeighbors,
  unlockedResidents,
  seasonalEvent,
  now,
  onMovePlayer,
  onSelectPlayer,
  onTalkTo,
  onSocialize,
  onLockedResident,
  onLockedBuilding,
}: Props) {
  const focusedResident = residents.find((entry) => entry.name === selected) ?? residents[playerIndex]!;

  return (
    <section className="home-grid">
      <div className="village-card illustrated">
        <img src={mapSrc} alt={mapAlt} />
        {seasonalEvent && (
          <div className="seasonal-banner">
            <span>{seasonalEvent.emoji}</span>
            <div>
              <strong>{seasonalEvent.name}</strong>
              <p>{seasonalEvent.message}</p>
            </div>
          </div>
        )}
        <div
          className="map-walk-layer"
          onPointerDown={onMovePlayer}
          role="application"
          aria-label="눌러서 모모몽을 이동시키는 마을 지도"
        />
        {buildings.map((building) => (
          <button
            key={building.key}
            className={`map-hit door-hit ${building.hitClassName} ${building.unlocked ? '' : 'locked-door'}`}
            aria-label={building.unlocked ? building.ariaLabel : `${building.ariaLabel} (구름에 가려짐)`}
            onClick={building.unlocked ? building.onEnter : onLockedBuilding}
          >
            {!building.unlocked && <span className="locked-badge" aria-hidden="true">☁️🔒</span>}
          </button>
        ))}
        <div className="social-neighbor-layer" aria-label="마을 사회활동 주민">
          {socialNeighbors.map((neighbor) => (
            <button
              key={neighbor.name}
              className="social-neighbor"
              style={{ left: `${neighbor.x}%`, top: `${neighbor.y}%` }}
              onClick={(event) => {
                event.stopPropagation();
                onSocialize(neighbor);
              }}
              aria-label={`${neighbor.name}에게 ${neighbor.actionLabel}`}
            >
              <img src={neighbor.sprite} alt="" />
              <span>{neighbor.actionLabel}</span>
              <em>{neighbor.name}</em>
            </button>
          ))}
        </div>
        <div className="moving-layer">
          {residents.map((entry, index) => {
            if (index !== playerIndex) return null;
            const position = positions[index] ?? { x: 50, y: 65 };
            const isPlayer = index === playerIndex;
            const isSelected = selected === entry.name;
            const isUnlocked = isPlayer || unlockedResidents.includes(entry.name);
            return (
              <button
                key={entry.name}
                className={[
                  'moving-character',
                  isPlayer ? 'player' : 'npc',
                  isPlayer && walking ? 'walking' : '',
                  isSelected ? 'selected' : '',
                  isUnlocked ? '' : 'locked',
                ].filter(Boolean).join(' ')}
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (isPlayer) onSelectPlayer();
                  else if (isUnlocked) onTalkTo(entry.name, index);
                  else onLockedResident(entry.name);
                }}
                aria-label={isPlayer ? '내 캐릭터 모모몽' : isUnlocked ? `${entry.name}에게 다가가기` : `아직 만나지 못한 주민`}
                aria-pressed={isSelected}
              >
                <img src={entry.sprite} alt="" />
                {isUnlocked ? <span>{isPlayer ? '내 모모몽' : entry.name}</span> : <span className="locked-tag">🔒 ???</span>}
              </button>
            );
          })}
        </div>
        <div className="speech" role="status">
          <strong>{focusedResident.name}</strong>
          <span>{getResidentActivity(focusedResident.name, now)}</span>
        </div>
      </div>
    </section>
  );
}
