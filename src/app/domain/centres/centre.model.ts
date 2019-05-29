import { ConcurrencySafeEntity, EntityInfoAndState, HasDescription, HasName, HasSlug, IConcurrencySafeEntity, IEntityInfo, IEntityInfoAndState, IEntitySet, JSONArray, JSONObject, Location } from '@app/domain';
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

export type ICentreInfoSet = IEntitySet<ICentre>;

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

  deserialize(input: JSONObject) {
    super.deserialize(input);

    if (input.description === undefined) {
      this.description = undefined;
    }

    if (input.studyNames) {
      this.studyNames = (input.studyNames as JSONArray)
        .map((sn: JSONObject) => new EntityInfoAndState<Study, StudyState>().deserialize(sn));
    }

    if (input.locations) {
      this.locations = (input.locations as JSONArray)
        .map((loc: JSONObject) => new Location().deserialize(loc));
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
