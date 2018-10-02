import { StudyState } from "@app/domain/studies/study-state.enum";
import { StudyCounts } from "@app/domain/studies/study-counts.model";
import { StudyStateUIMap } from "@app/domain/studies/study-state-ui-map.model";

export interface StudyCountInfo {

  readonly stateLabel?: string;
  readonly count?: number;
  readonly icon?: string;
  readonly iconClass?: string;

}

export type StudyCountsUIMap = Map<StudyState, StudyCountInfo>;

export function studyCountsToUIMap(counts: StudyCounts): StudyCountsUIMap {
  if (Object.keys(counts).length === 0) {
    return new Map<StudyState, StudyCountInfo>();
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
