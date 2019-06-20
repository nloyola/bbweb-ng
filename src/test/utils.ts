import { DomainEntity } from '@app/domain';
import { Dictionary } from '@ngrx/entity';

export namespace TestUtils {

  export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  export function entitiesToDictionary<T extends DomainEntity>(entities: T[]): Dictionary<T> {
    const result = {};
    entities.forEach(e => {
      result[e.id] = e;
    });
    return result;
  }

}
