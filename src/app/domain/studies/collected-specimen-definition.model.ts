import { SpecimenDefinition } from './specimen-definition.model';

/**
 * Used to configure a *Specimen Type* used by a {@link Study}.
 *
 * It records ownership, summary, storage, and classification information that applies to an
 * entire group or collection of {@link Specimens}. A *Collection Specimen Definition* is
 * defined for specimen types collected from {@link Participants}.
 */
export class CollectedSpecimenDefinition extends SpecimenDefinition {

  /**
   * The amount per specimen, measured in units, to be collected.
   * @see #units
   */
  amount: number;

  /**
   * The number of specimens to be collected.
   * @see #units
   */
  maxCount: number;

  deserialize(input: any) {
    Object.assign(this, input);
    return this;
  }
}
