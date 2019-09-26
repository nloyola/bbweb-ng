import {
  ConcurrencySafeEntity,
  EntityInfoAndState,
  EntityInfoSet,
  HasDescription,
  HasName,
  HasSlug,
  IConcurrencySafeEntity,
  IEntityInfo,
  IEntityInfoAndState,
  IEntityInfoSet,
  Location
} from '@app/domain';
import { Study, StudyState, StudyStateInfo } from '@app/domain/studies';
import { CentreState } from './centre-state.enum';

export interface ICentre extends IConcurrencySafeEntity, HasSlug, HasName, HasDescription {
  /**
   * The state can be one of: enabled or disabled.
   */
  state: CentreState;

  studyNames: StudyStateInfo[];

  locations: Location[];
}

export type ICentreInfo = IEntityInfo<ICentre>;

export type ICentreInfoAndState = IEntityInfoAndState<ICentre, CentreState>;

export type ICentreInfoSet = IEntityInfoSet<ICentre>;

/*
 * A Centre represents a collection of participants and specimens collected for a particular research centre.
 */
export class Centre extends ConcurrencySafeEntity implements ICentre {
  slug: string;
  name: string;
  description: string | null;
  state: CentreState;
  studyNames: StudyStateInfo[];
  locations: Location[];

  deserialize(input: ICentre): this {
    const { slug, name, state } = input;
    Object.assign(this, { slug, name, state });
    super.deserialize(input);

    if (input.description !== undefined) {
      this.description = input.description;
    }

    if (input.studyNames) {
      this.studyNames = input.studyNames.map(sn =>
        new EntityInfoAndState<Study, StudyState>().deserialize(sn)
      );
    }

    if (input.locations) {
      this.locations = input.locations.map(loc => new Location().deserialize(loc));
    }
    return this;
  }

  /**
   * Used to query the centre's current state.
   *
   * @returns {boolean} <code>true</code> if the centre is in <code>disabled</code> state.
   */
  isDisabled(): boolean {
    return this.state === CentreState.Disabled;
  }

  /**
   * Used to query the centre's current state.
   *
   * @returns {boolean} <code>true</code> if the centre is in <code>enabled</code> state.
   */
  isEnabled(): boolean {
    return this.state === CentreState.Enabled;
  }

  hasStudies(): boolean {
    return this.studyNames.length > 0;
  }

  hasLocations(): boolean {
    return this.locations.length > 0;
  }
}

/* tslint:disable-next-line:max-classes-per-file */
export class CentreStateInfo extends EntityInfoAndState<Centre, CentreState> {}

/* tslint:disable-next-line:max-classes-per-file */
export class CentreInfoSet extends EntityInfoSet<ICentre, Centre> {}
