import { ConcurrencySafeEntity, EntityInfo, HasSlug, HasName } from '@app/domain';

export abstract class AccessItem extends ConcurrencySafeEntity implements HasSlug, HasName {

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
   * This AccessItem's parents.
   */
  parentData: EntityInfo[];

  /**
   * This AccessItem's children.
   */
  childData: EntityInfo[];

  deserialize(input: any) {
    super.deserialize(input);
    if (input.parentData) {
      this.parentData = input.parentData.map((p: any) => new EntityInfo().deserialize(p));
    }
    if (input.childData) {
      this.childData = input.childData.map((c: any) => new EntityInfo().deserialize(c));
    }
    return this;
  }

}
