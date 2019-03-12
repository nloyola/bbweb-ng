import { AnatomicalSource, DomainEntity, HasDescription, HasName, HasSlug, PreservationTemperature, PreservationType, SpecimenType } from '@app/domain';

export interface ISpecimenDefinition extends DomainEntity, HasSlug, HasName, HasDescription {

  anatomicalSourceType: AnatomicalSource;

  preservationType: PreservationType;

  preservationTemperature: PreservationTemperature;

  specimenType: SpecimenType;

  /**
   * Specifies how the specimen amount is measured (e.g. volume, weight, length, etc.).
   */
  units: string;
}

/**
 * Used to configure a *Specimen Type* used by a {@link Study}.
 *
 * It records ownership, summary, storage, and classification information that applies to an entire group or
 * collection of {@link Specimens}.
 */
export abstract class SpecimenDefinition extends DomainEntity implements ISpecimenDefinition {

  slug: string;
  name: string;
  description: string | null;
  anatomicalSourceType: AnatomicalSource;
  preservationType: PreservationType;
  preservationTemperature: PreservationTemperature;
  specimenType: SpecimenType;
  units: string;

  static sortSpecimenDefinitions(specimenDefinitions: SpecimenDefinition[]): SpecimenDefinition[] {
    const sortedSpecimenDefinitions = specimenDefinitions.slice(0);
    sortedSpecimenDefinitions.sort((a: SpecimenDefinition, b: SpecimenDefinition): number => {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    });
    return sortedSpecimenDefinitions;
  }

}
