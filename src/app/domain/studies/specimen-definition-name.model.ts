import { EntityInfo, IEntityInfo } from '@app/domain';
import { ISpecimenDefinition, SpecimenDefinition } from './specimen-definition.model';

export type ISpecimenDefinitionName = IEntityInfo<ISpecimenDefinition>;

export class SpecimenDefinitionName extends EntityInfo<SpecimenDefinition>
  implements ISpecimenDefinitionName { }
