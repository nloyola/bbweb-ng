import { EntityUI } from '@app/domain';
import { StudyCounts } from '@app/domain/studies/study-counts.model';
import { StudyStateUIMap } from '@app/domain/studies/study-state-ui-map.model';
import { StudyState } from '@app/domain/studies/study-state.enum';

export interface StudyCountInfo extends EntityUI {
  readonly count?: number;
}

export type StudyCountsUIMap = Map<StudyState, StudyCountInfo>;

export function studyCountsToUIMap(counts: StudyCounts): StudyCountsUIMap {
  if (Object.keys(counts).length === 0) {
    return undefined;
  }

  return new Map<StudyState, StudyCountInfo>([
    [
      StudyState.Disabled,
      {
      count: counts.disabledCount,
      ...StudyStateUIMap.get(StudyState.Disabled)
      }
    ],
    [
      StudyState.Enabled,
      {
      count: counts.enabledCount,
      ...StudyStateUIMap.get(StudyState.Enabled)
      }
    ],
    [
      StudyState.Retired,
      {
      count: counts.retiredCount,
        ...StudyStateUIMap.get(StudyState.Retired)
      }
    ]
  ]);
}
