import { ConcurrencySafeEntity, EntityInfo, HasDescription, HasName, HasSlug, IConcurrencySafeEntity, IEntityInfo, JSONArray, JSONObject } from '@app/domain';

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

  deserialize(input: JSONObject) {
    super.deserialize(input);
    if (input.parentData) {
      this.parentData = (input.parentData as JSONArray)
        .map((p: JSONObject) => new EntityInfo().deserialize(p));
    }
    if (input.childData) {
      this.childData = (input.childData as JSONArray)
        .map((c: JSONObject) => new EntityInfo().deserialize(c));
    }
    return this;
  }

}
