import { EntityUI } from '@app/domain';
import { UserCounts } from '@app/domain/users/user-counts.model';
import { UserStateUIMap } from '@app/domain/users/user-state-ui-map.model';
import { UserState } from '@app/domain/users/user-state.enum';

export interface UserCountInfo extends EntityUI {
  readonly count?: number;
}

export type UserCountsUIMap = Map<UserState, UserCountInfo>;

export function userCountsToUIMap(counts: UserCounts): UserCountsUIMap {
  if (Object.keys(counts).length === 0) {
    return undefined;
  }

  return new Map<UserState, UserCountInfo>([
    [
      UserState.Registered,
      {
        count: counts.registeredCount,
        ...UserStateUIMap.get(UserState.Registered)
      }
    ],
    [
      UserState.Active,
      {
        count: counts.activeCount,
        ...UserStateUIMap.get(UserState.Active)
      }
    ],
    [
      UserState.Locked,
      {
        count: counts.lockedCount,
        ...UserStateUIMap.get(UserState.Locked)
      }
    ]
  ]);
}
