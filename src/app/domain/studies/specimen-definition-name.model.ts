import { EntityInfo, IEntityInfo } from '@app/domain';
import { ISpecimenDefinition, SpecimenDefinition } from './specimen-definition.model';

export interface ISpecimenDefinitionName extends IEntityInfo<ISpecimenDefinition> { }

export class SpecimenDefinitionName extends EntityInfo<SpecimenDefinition>
  implements ISpecimenDefinitionName { }
