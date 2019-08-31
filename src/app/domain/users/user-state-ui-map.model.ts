import { EntityUI } from '@app/domain/entity-ui.model';
import { UserState } from '@app/domain/users/user-state.enum';

export const UserStateUIMap = new Map<UserState, EntityUI>([
  [
    UserState.Registered,
    {
      stateLabel: 'Registered',
      icon: 'supervised_user_circle',
      iconClass: 'warning-icon'
    }
  ],
  [
    UserState.Active,
    {
      stateLabel: 'Active',
      icon: 'verified_user',
      iconClass: 'success-icon'
    }
  ],
  [
    UserState.Locked,
    {
      stateLabel: 'Locked',
      icon: 'lock',
      iconClass: 'danger-icon'
    }
  ]
]);
