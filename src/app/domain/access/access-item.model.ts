import {
  ConcurrencySafeEntity,
  EntityInfo,
  HasDescription,
  HasName,
  HasSlug,
  IConcurrencySafeEntity,
  IEntityInfo,
  JSONArray,
  JSONObject
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

export type IAccessItemInfo = IEntityInfo<IAccessItem>;

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
      this.parentData = input.parentData.map(pd => new EntityInfo().deserialize(pd));
    }
    if (input.childData) {
      this.childData = input.childData.map(cd => new EntityInfo().deserialize(cd));
    }
    return this;
  }
}
