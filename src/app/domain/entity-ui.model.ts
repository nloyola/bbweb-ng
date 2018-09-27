import { ConcurrencySafeEntity } from "@app/domain/concurrency-safe-entity.model";

export interface EntityUI<T extends ConcurrencySafeEntity> {

  readonly entity?: T;
  readonly stateLabel?: string;
  readonly icon?: string;
  readonly iconClass?: string;

}
