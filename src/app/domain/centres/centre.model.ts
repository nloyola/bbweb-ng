import { EntityInfo, HasDescription, HasName, HasSlug, Location, EntityNameAndState } from '@app/domain';
import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';
import { CentreState } from './centre-state.enum';
import { StudyState } from '../studies';

/*
 * A Centre represents a collection of participants and specimens collected for a particular research centre.
 */
export class Centre extends ConcurrencySafeEntity implements HasSlug, HasName, HasDescription {

  slug: string;

  /**
   * A short identifying name that is unique.
   */
  name: string;

  /**
   * An optional description that can provide additional details on the name.
   */
  description: string | null;

  /**
   * The state can be one of: enabled, disabled, or retired.
   */
  state: CentreState;

  studyNames: EntityNameAndState<StudyState>[];

  locations: Location[];

  deserialize(input: any) {
    super.deserialize(input);

    if (input.description === undefined) {
      this.description = undefined;
    }

    if (input.studyNames) {
      this.studyNames = input.studyNames
        .map((sn: any) => new EntityInfo().deserialize(sn));
    }

    if (input.locations) {
      this.locations = input.locations
        .map((loc: any) => new Location().deserialize(loc));
    }
    return this;
  }

  /**
   * Used to query the centre's current state.
   *
   * @returns {boolean} <code>true</code> if the centre is in <code>disabled</code> state.
   */
  isDisabled(): boolean {
    return (this.state === CentreState.Disabled);
  }

  /**
   * Used to query the centre's current state.
   *
   * @returns {boolean} <code>true</code> if the centre is in <code>enabled</code> state.
   */
  isEnabled(): boolean {
    return (this.state === CentreState.Enabled);
  }

  hasStudies(): boolean {
    return this.studyNames.length > 0;
  }

  hasLocations(): boolean {
    return this.locations.length > 0;
  }

}

export type CentreToAdd = Pick<Centre, 'name' | 'description' >;
