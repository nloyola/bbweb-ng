import { EntityUI } from '@app/domain/entity-ui.model';
import { CentreState } from '@app/domain/centres/centre-state.enum';

export const CentreStateUIMap = new Map<CentreState, EntityUI>([
  [
    CentreState.Disabled,
    {
      stateLabel: 'Disabled',
      icon: 'settings',
      iconClass: 'warning-icon'
    }
  ],
  [
    CentreState.Enabled,
    {
      stateLabel: 'Enabled',
      icon: 'check_circle',
      iconClass: 'success-icon'
    }
  ]

]);
