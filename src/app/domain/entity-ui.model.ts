import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';

export interface EntityUI {
  readonly stateLabel: string;
  readonly icon: string;
  readonly iconClass: string;
}

export interface DomainEntityUI<T extends ConcurrencySafeEntity> {
  readonly entity: T;
  stateLabel(): string;
  stateIcon(): string;
  stateIconClass(): string;
}
