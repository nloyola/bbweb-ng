import { NamedEntityInfo, INamedEntityInfo } from '@app/domain';
import { ISpecimenDefinition, SpecimenDefinition } from './specimen-definition.model';

export interface ISpecimenDefinitionName extends INamedEntityInfo<ISpecimenDefinition> {}

export class SpecimenDefinitionName extends NamedEntityInfo<SpecimenDefinition>
  implements ISpecimenDefinitionName {}
