import { ConcurrencySafeEntity, HasSlug, IConcurrencySafeEntity, JSONArray, JSONObject } from '@app/domain';
import { SpecimenState } from './specimen-state.enum';
import { ICentreLocationInfo, CentreLocationInfo } from '../centres';

export interface ISpecimen extends IConcurrencySafeEntity, HasSlug {
  /**
   * The unique inventory ID for this specimen.
   */
  inventoryId: string;

  /**
   * The ID corresponding to the the {@link domain.studies.CollectionSpecimenDefinition
   * SpecimenDefinition} for this specimen.
   */
  specimenDefinitionId: string;

  /**
   * The name of the {@link domain.studies.CollectionSpecimenDefinition SpecimenDefinition} for this specimen.
   */
  specimenDefinitionName?: string;

  /**
   * The units of the {@link domain.studies.CollectionSpecimenDefinition SpecimenDefinition} for
   * this specimen.
   */
  specimenDefinitionUnits?: string;

  /**
   * The location of the {@link domain.participants.Centre} where this specimen was created.
   */
  originLocationInfo: ICentreLocationInfo;

  /**
   * The location of the {@link domain.participants.Centre} where this specimen was is currently located.
   */
  locationInfo: ICentreLocationInfo;

  /**
   * The ID of the {@link domain.participants.Container} this specimen is stored in.
   */
  containerId?: string;

  /**
   * The {@link domain.centres.ContainerSchemaPosition} (i.e. position or label) this specimen has in its
   * container.
   */
  positionId?: string;

  /**
   * The date and time when the specimen was physically created. Not necessarily when this specimen was
   * added to the application.
   */
  timeCreated: Date;

  /**
   * The amount this specimen contains, in units specified in {@link
   * domain.studies.CollectionSpecimenDefinition#units CollectionSpecimenDefinition#units}.
   */
  amount: number;

  /**
   * Whether or not the amount held for this specimen is the default for the {@link
   * app.domain.studies.Study Study}.
   */
  isDefaultAmount?: boolean;

  /**
   * The state for this specimen. One of: Usable or Unusable.
   */
  state: SpecimenState;

  /**
   * The name of the event type this specimen belongs to.
   */
  eventTypeName: string;

}

export class Specimen extends ConcurrencySafeEntity implements ISpecimen {

  slug: string;
  inventoryId: string;
  specimenDefinitionId: string;
  specimenDefinitionName?: string;
  specimenDefinitionUnits?: string;
  originLocationInfo: CentreLocationInfo;
  locationInfo: CentreLocationInfo;
  containerId?: string;
  positionId?: string;
  timeCreated: Date;
  amount: number;
  isDefaultAmount?: boolean;
  state: SpecimenState;
  eventTypeName: string;

  deserialize(input: JSONObject) {
    super.deserialize(input);

    if (input.timeCreated) {
      this.timeCreated = new Date(input.timeCreated as string);
    }

    if (input.originLocationInfo) {
      this.originLocationInfo = new CentreLocationInfo().deserialize(input.originLocationInfo as JSONObject);
    }

    if (input.locationInfo) {
      this.locationInfo = new CentreLocationInfo().deserialize(input.locationInfo as JSONObject);
    }

    return this;
  }
}
