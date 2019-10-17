import { ConcurrencySafeEntity, HasSlug, IConcurrencySafeEntity } from '@app/domain';
import { CentreLocationInfo, ICentreLocationInfo } from '../centres';
import { NamedEntityInfo } from '../entity-info.model';
import { CollectionEventType, EventTypeInfo } from '../studies/collection-event-type.model';
import { EventInfo } from './collection-event.model';
import { ParticipantInfo } from './participant.model';
import { SpecimenState } from './specimen-state.enum';
import { StudyInfo, CollectedSpecimenDefinition, SpecimenDefinition } from '../studies';

export interface ISpecimen extends IConcurrencySafeEntity, HasSlug {
  /**
   * The unique inventory ID for this specimen.
   */
  inventoryId: string;

  /**
   * The ID corresponding to the the {@link domain.studies.CollectionEvent CollectionEvent} this specimen
   * belongs to.
   */
  event: EventInfo;

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
   * The collection event type this specimen belongs to.
   */
  eventType: EventTypeInfo;

  /**
   * The study this specimen belongs to.
   */
  study: StudyInfo;

  /**
   * The participant this specimen belongs to.
   */
  participant: ParticipantInfo;
}

export class Specimen extends ConcurrencySafeEntity implements ISpecimen {
  slug: string;
  inventoryId: string;
  event: EventInfo;
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
  eventType: NamedEntityInfo<CollectionEventType>;
  study: StudyInfo;
  participant: ParticipantInfo;
  _specimenDefinition: SpecimenDefinition;

  /**
   * Returns the name for a specimen of this type.
   */
  name(): string {
    this.checkSpecimenDefinitionDefined();
    return this._specimenDefinition.name;
  }

  /**
   * Returns the default amount that should be collected for a specimen of this type.
   */
  defaultAmount(): number {
    this.checkSpecimenDefinitionDefined();
    if (this._specimenDefinition instanceof CollectedSpecimenDefinition) {
      return (this._specimenDefinition as CollectedSpecimenDefinition).amount;
    }
    throw new Error('specimen definition is not for a collected specimen');
  }

  set specimenDefinition(specimenDefinition: SpecimenDefinition) {
    if (this.specimenDefinitionId && this.specimenDefinitionId !== specimenDefinition.id) {
      throw new Error('specimen definitions do not match');
    }
    this._specimenDefinition = specimenDefinition;
  }

  deserialize(input: ISpecimen): this {
    const {
      slug,
      inventoryId,
      specimenDefinitionId,
      specimenDefinitionName,
      specimenDefinitionUnits,
      amount,
      state
    } = input;
    Object.assign(this, {
      slug,
      inventoryId,
      specimenDefinitionId,
      specimenDefinitionName,
      specimenDefinitionUnits,
      amount,
      state
    });
    super.deserialize(input);

    if (input.timeCreated) {
      this.timeCreated = new Date(input.timeCreated);
    }

    const { collectionEvent } = input as any;
    if (collectionEvent !== undefined) {
      this.event = new EventInfo().deserialize(collectionEvent);
    }

    if (input.originLocationInfo) {
      this.originLocationInfo = new CentreLocationInfo().deserialize(input.originLocationInfo);
    }

    if (input.locationInfo) {
      this.locationInfo = new CentreLocationInfo().deserialize(input.locationInfo);
    }

    if (input.eventType !== undefined) {
      this.eventType = new EventTypeInfo().deserialize(input.eventType);
    }

    if (input.study !== undefined) {
      this.study = new StudyInfo().deserialize(input.study);
    }

    if (input.participant !== undefined) {
      this.participant = new ParticipantInfo().deserialize(input.participant);
    }

    return this;
  }

  private checkSpecimenDefinitionDefined() {
    if (this._specimenDefinition === undefined) {
      throw new Error('specimen spec not assigned');
    }
  }
}
