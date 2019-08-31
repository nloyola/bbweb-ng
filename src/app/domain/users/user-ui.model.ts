import { DomainEntityUI } from '@app/domain/entity-ui.model';
import { UserStateUIMap } from '@app/domain/users/user-state-ui-map.model';
import { UserState } from '@app/domain/users/user-state.enum';
import { User } from '@app/domain/users/user.model';

export class UserUI implements DomainEntityUI<User> {
  readonly entity: User;

  public static getStateIcon(state: UserState): string {
    return UserStateUIMap.get(state).icon;
  }

  public static getStateIconClass(state: UserState): string {
    return UserStateUIMap.get(state).iconClass;
  }

  constructor(user: User) {
    this.entity = user;
  }

  get id() {
    return this.entity.id;
  }

  get slug() {
    return this.entity.slug;
  }

  get name() {
    return this.entity.name;
  }

  get email() {
    return this.entity.email;
  }

  get timeAdded(): Date {
    return this.entity.timeAdded;
  }

  get timeModified(): Date | null {
    return this.entity.timeModified;
  }

  stateLabel(): string {
    return UserStateUIMap.get(this.entity.state).stateLabel;
  }

  stateIcon(): string {
    return UserStateUIMap.get(this.entity.state).icon;
  }

  stateIconClass(): string {
    return UserStateUIMap.get(this.entity.state).iconClass;
  }

  isRegistered(): boolean {
    return this.entity.isRegistered();
  }

  isActive(): boolean {
    return this.entity.isActive();
  }

  isLocked(): boolean {
    return this.entity.isLocked();
  }
}
