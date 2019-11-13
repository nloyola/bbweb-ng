import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JSONArray, JSONObject, PagedReply, SearchParams, searchParamsToHttpParams } from '@app/domain';
import { ApiReply } from '@app/domain/api-reply.model';
import { Shipment, ShipmentSpecimen } from '@app/domain/shipments';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShipmentSpecimenService {
  readonly BASE_URL = '/api/shipments/specimens';

  constructor(private http: HttpClient) {}

  /**
   * Retrieves a Shipment from the server.
   *
   * @param {string} slug the slug of the shipment to retrieve.
   */
  get(id: string): Observable<ShipmentSpecimen> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${id}`).pipe(map(this.replyToShipmentSpecimen));
  }

  /**
   * Used to search Shipments.
   */
  search(shipment: Shipment, searchParams: SearchParams): Observable<PagedReply<ShipmentSpecimen>> {
    let params = searchParamsToHttpParams(searchParams);
    return this.http.get<ApiReply>(`${this.BASE_URL}/${shipment.id}`, { params }).pipe(
      // delay(1000),
      map((reply: ApiReply) => {
        const jObj = reply.data as JSONObject;
        if (reply && reply.data && jObj.items) {
          const entities: ShipmentSpecimen[] = (jObj.items as JSONArray).map((obj: any) =>
            new ShipmentSpecimen().deserialize(obj)
          );

          return {
            searchParams,
            entities,
            offset: jObj.offset as number,
            total: jObj.total as number,
            maxPages: jObj.maxPages as number
          };
        }
        throw new Error('expected a paged reply');
      })
    );
  }

  private replyToShipmentSpecimen(reply: ApiReply): ShipmentSpecimen {
    if (reply && reply.data) {
      return new ShipmentSpecimen().deserialize(reply.data as any);
    }
    throw new Error('expected a shipment specimen object');
  }
}
