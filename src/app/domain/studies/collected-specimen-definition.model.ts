import { ISpecimenDefinition, SpecimenDefinition } from './specimen-definition.model';

export interface ICollectedSpecimenDefinition extends ISpecimenDefinition {
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
}

/**
 * Used to configure a *Specimen Type* used by a {@link Study}.
 *
 * It records ownership, summary, storage, and classification information that applies to an
 * entire group or collection of {@link Specimens}. A *Collection Specimen Definition* is
 * defined for specimen types collected from {@link Participants}.
 */
export class CollectedSpecimenDefinition extends SpecimenDefinition implements ICollectedSpecimenDefinition {
  amount: number;
  maxCount: number;

  deserialize(input: ICollectedSpecimenDefinition): this {
    const { amount, maxCount } = input;
    Object.assign(this, { amount, maxCount });
    super.deserialize(input);
    return this;
  }
}
