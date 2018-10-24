import { AnatomicalSource, DomainEntity, HasDescription, HasName, HasSlug, PreservationTemperature, PreservationType, SpecimenType } from '@app/domain';

/**
 * Used to configure a *Specimen Type* used by a {@link Study}.
 *
 * It records ownership, summary, storage, and classification information that applies to an entire group or
 * collection of {@link Specimens}.
 */
export abstract class SpecimenDefinition extends DomainEntity implements HasSlug, HasName, HasDescription {

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
   * Specifies how the specimen amount is measured (e.g. volume, weight, length, etc.).
   */
  units: string;

  anatomicalSourceType: AnatomicalSource;

  preservationType: PreservationType;

  preservationTemperature: PreservationTemperature;

  specimenType: SpecimenType;

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
