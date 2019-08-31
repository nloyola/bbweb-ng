import { EntityUI } from '@app/domain/entity-ui.model';
import { StudyState } from '@app/domain/studies/study-state.enum';

export const StudyStateUIMap = new Map<StudyState, EntityUI>([
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
