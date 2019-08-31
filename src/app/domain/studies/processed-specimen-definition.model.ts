import { SpecimenDefinition, ISpecimenDefinition } from './specimen-definition.model';

export type IProcessedSpecimenDefinition = ISpecimenDefinition;

/**
 * Used to configure a *Specimen Type* used in a processing step for a {@link Study}.
 *
 * It records ownership, summary, storage, and classification information that applies to an
 * entire group or collection of {@link Specimens}. A *Processed Specimen Definition* is defined
 * for specimen types processed from collected specimens.
 */
export class ProcessedSpecimenDefinition extends SpecimenDefinition implements IProcessedSpecimenDefinition {}
