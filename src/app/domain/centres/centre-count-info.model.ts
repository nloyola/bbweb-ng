import { EntityUI } from '@app/domain';
import { CentreCounts } from '@app/domain/centres/centre-counts.model';
import { CentreStateUIMap } from '@app/domain/centres/centre-state-ui-map.model';
import { CentreState } from '@app/domain/centres/centre-state.enum';

export interface CentreCountInfo extends EntityUI {
  readonly count?: number;
}

export type CentreCountsUIMap = Map<CentreState, CentreCountInfo>;

export function centreCountsToUIMap(counts: CentreCounts): CentreCountsUIMap {
  if (Object.keys(counts).length === 0) {
    return undefined;
  }

  return new Map<CentreState, CentreCountInfo>([
    [
      CentreState.Disabled,
      {
        count: counts.disabledCount,
        ...CentreStateUIMap.get(CentreState.Disabled)
      }
    ],
    [
      CentreState.Enabled,
      {
        count: counts.enabledCount,
        ...CentreStateUIMap.get(CentreState.Enabled)
      }
    ]
  ]);
}
