import { JSONObject } from './json-object.model';

export interface Deserializable {

  deserialize(input: JSONObject): this;

}
