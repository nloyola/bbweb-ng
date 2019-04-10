import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JSONArray, JSONObject, Location, PagedReply, SearchParams } from '@app/domain';
import { ApiReply } from '@app/domain/api-reply.model';
import { Shipment } from '@app/domain/shipments';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type ShipmentUpdateAttribute =
  'courierName'
  | 'trackingNumber'
  | 'fromLocation'
  | 'toLocation'
  | 'state';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {

  readonly BASE_URL = '/api/shipments';

  constructor(private http: HttpClient) {}

  /**
  * Retrieves a Shipment from the server.
  *
  * @param {string} slug the slug of the shipment to retrieve.
  */
  get(slug: string): Observable<Shipment> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${slug}`)
      .pipe(map(this.replyToShipment));
  }

  /**
   * Used to search shipments.
   *
   * <p>A paged API is used to list shipments. See below for more details.</p>
   *
   * @param searchParams - The options to use to search for shipments.
   *
   * @returns The shipments within a PagedReply.
   */
  search(searchParams: SearchParams): Observable<PagedReply<Shipment>> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/search`,
                                   { params: searchParams.httpParams() })
      .pipe(
        // delay(1000),
        map((reply: ApiReply) => {
          const jObj = reply.data as JSONObject;
          if (reply && reply.data && jObj.items) {
            const entities: Shipment[] = (jObj.items as JSONArray)
              .map((obj: JSONObject) => new Shipment().deserialize(obj));

            return {
              searchParams,
              entities,
              offset: jObj.offset as number,
              total: jObj.total as number,
              maxPages: jObj.maxPages as number
            };
          }
          throw new Error('expected a paged reply');
        }));
  }

  add(shipment: Shipment): Observable<Shipment> {
    const json = {
      courierName: shipment.courierName,
      trackingNumber: shipment.trackingNumber,
      fromLocationId: shipment.fromLocationInfo.locationId,
      toLocationId: shipment.toLocationInfo.locationId
    };
    return this.http.post<ApiReply>(`${this.BASE_URL}/`, json)
      .pipe(
        // delay(2000),
        map(this.replyToShipment));
  }

  update(
    shipment: Shipment,
    attributeName: ShipmentUpdateAttribute,
    value: string | Date
  ): Observable<Shipment> {
    let url: string;
    let json = { expectedVersion: shipment.version };

    switch (attributeName) {
      case 'courierName':
        json = { ...json, courierName: value } as any;
        url = `${this.BASE_URL}/courier/${shipment.id}`;
        break;

      case 'trackingNumber':
        json = { ...json, trackingNumber: value } as any;
        url = `${this.BASE_URL}/trackingnumber/${shipment.id}`;
        break;

      case 'fromLocation':
        json = { ...json, locationId: value } as any;
        url = `${this.BASE_URL}/fromlocation/${shipment.id}`;
        break;

      case 'toLocation':
        json = { ...json, locationId: value } as any;
        url = `${this.BASE_URL}/tolocation/${shipment.id}`;
        break;

      case 'state':
        const validValues = [ 'created', 'packed', 'sent', 'received', 'unpacked', 'completed', 'lost' ];
        if (!validValues.includes(value as string)) {
          throw new Error(`invalid value for state: ${value}`);
        }
        url = `${this.BASE_URL}/${value}/${shipment.id}`;
        break;

      default:
        throw new Error('invalid attribute name for update: ' + attributeName);
    }

    if (['studyRemove', 'locationRemove'].includes(attributeName)) {
      return this.http.delete<ApiReply>(url).pipe(map(this.replyToShipment));
    }
    return this.http.post<ApiReply>(url, json).pipe(map(this.replyToShipment));
  }

  private replyToShipment(reply: ApiReply): Shipment {
    if (reply && reply.data) {
      return new Shipment().deserialize(reply.data as JSONObject);
    }
    throw new Error('expected a shipment object');
  }
}
