import {
  ConcurrencySafeEntity,
  HasDescription,
  HasName,
  HasSlug,
  IConcurrencySafeEntity,
  NamedEntityInfo,
  INamedEntityInfo
} from '@app/domain';

export interface IAccessItem extends IConcurrencySafeEntity, HasSlug, HasName, HasDescription {
  /**
   * This AccessItem's parents.
   */
  parentData: IAccessItemInfo[];

  /**
   * This AccessItem's children.
   */
  childData: IAccessItemInfo[];
}

export type IAccessItemInfo = INamedEntityInfo<IAccessItem>;

export abstract class AccessItem extends ConcurrencySafeEntity implements IAccessItem {
  slug: string;
  name: string;
  description: string | null;
  parentData: IAccessItemInfo[];
  childData: IAccessItemInfo[];

  deserialize(input: IAccessItem): this {
    const { slug, name } = input;
    Object.assign(this, { slug, name });
    super.deserialize(input);

    if (input.description !== undefined) {
      this.description = input.description;
    }

    if (input.parentData) {
      this.parentData = input.parentData.map(pd => new NamedEntityInfo().deserialize(pd));
    }
    if (input.childData) {
      this.childData = input.childData.map(cd => new NamedEntityInfo().deserialize(cd));
    }
    return this;
  }
}
