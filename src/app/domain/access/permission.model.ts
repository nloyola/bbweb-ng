import { AccessItem } from '../access/access-item.model';

export class Permission extends AccessItem {

  deserialize(input: any) {
    super.deserialize(input);
    return this;
  }
}
