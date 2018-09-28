import { StudyState } from "@app/domain/studies/study-state.enum";
import { EntityUI, NoEntityUI } from "@app/domain/entity-ui.model";
import { Study } from "@app/domain/studies/study.model";
import { ConcurrencySafeEntity } from "@app/domain/concurrency-safe-entity.model";

export const StudyStateUIMap = new Map<StudyState, NoEntityUI<Study>>([
  [
    StudyState.Disabled,
    {
      stateLabel: 'Disabled',
      icon: 'settings',
      iconClass: 'warning-icon'
    }
  ],
  [
    StudyState.Enabled,
    {
      stateLabel: 'Enabled',
      icon: 'check_circle',
      iconClass: 'success-icon'
    }
  ],
  [
    StudyState.Retired,
    {
      stateLabel: 'Retired',
      icon: 'remove_circle',
      iconClass: 'danger-icon'
    }
  ]

]);
