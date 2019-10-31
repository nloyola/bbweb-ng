import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';

export type IconClass = 'success-icon' | 'warning-icon' | 'danger-icon';

export interface EntityUI {
  readonly stateLabel: string;
  readonly icon: string;
  readonly iconClass: IconClass;
}

export interface DomainEntityUI<T extends ConcurrencySafeEntity> {
  readonly entity: T;
  stateLabel(): string;
  stateIcon(): string;
  stateIconClass(): string;
}
