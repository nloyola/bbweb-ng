/** Matches a JSON object */
export interface JSONObject {
  [key: string]: JSONValue;
}

/** Matches a JSON array */
export interface JSONArray extends Array<JSONValue> {} // tslint:disable-line

/** Matches any valid JSON value */
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
