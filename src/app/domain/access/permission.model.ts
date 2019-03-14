import { AccessItem } from './access-item.model';
import { JSONObject } from '@app/domain';

export class Permission extends AccessItem {

  deserialize(input: JSONObject) {
    super.deserialize(input);
    return this;
  }
}
