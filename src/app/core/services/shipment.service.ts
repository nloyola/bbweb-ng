import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JSONArray, JSONObject, PagedReply, SearchParams, searchParamsToHttpParams } from '@app/domain';
import { ApiReply } from '@app/domain/api-reply.model';
import { Specimen } from '@app/domain/participants';
import { Shipment, ShipmentItemState, ShipmentState } from '@app/domain/shipments';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CentreLocationInfo } from '@app/domain/centres';

export type ShipmentUpdateAttribute =
  | 'courierName'
  | 'trackingNumber'
  | 'fromLocation'
  | 'toLocation'
  | 'state';

export enum ShipmentStateTransision {
  Created = 'created',
  Packed = 'packed',
  Sent = 'sent',
  Received = 'received',
  Unpacked = 'unpacked',
  Completed = 'completed',
  Lost = 'lost',
  SkipToSent = 'skip-to-sent',
  SkipToUnpacked = 'skip-to-unpacked'
}

export interface ShipmentStateChange {
  transition: ShipmentStateTransision;
  datetime?: Date;
  skipDatetime?: Date; // used only when transitioning to 'skipToSent' or 'skipToUnpacked'
}

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
  get(id: string): Observable<Shipment> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${id}`).pipe(map(this.replyToShipment));
  }

  /**
   * Used to search Shipments.
   */
  search(searchParams: SearchParams): Observable<PagedReply<Shipment>> {
    let params = searchParamsToHttpParams(searchParams);
    return this.http.get<ApiReply>(`${this.BASE_URL}/list`, { params }).pipe(
      // delay(1000),
      map((reply: ApiReply) => {
        const jObj = reply.data as JSONObject;
        if (reply && reply.data && jObj.items) {
          const entities: Shipment[] = (jObj.items as JSONArray).map(obj =>
            new Shipment().deserialize(obj as any)
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

  add(shipment: Shipment): Observable<Shipment> {
    const json = {
      courierName: shipment.courierName,
      trackingNumber: shipment.trackingNumber,
      fromLocationId: shipment.fromLocationInfo.locationId,
      toLocationId: shipment.toLocationInfo.locationId
    };
    return this.http.post<ApiReply>(`${this.BASE_URL}/`, json).pipe(
      // delay(2000),
      map(this.replyToShipment)
    );
  }

  update(
    shipment: Shipment,
    attributeName: ShipmentUpdateAttribute,
    value: string | CentreLocationInfo | ShipmentStateChange
  ): Observable<Shipment> {
    let url: string;
    let json: any = { expectedVersion: shipment.version };

    switch (attributeName) {
      case 'courierName':
        json = { ...json, courierName: value };
        url = `${this.BASE_URL}/courier/${shipment.id}`;
        break;

      case 'trackingNumber':
        json = { ...json, trackingNumber: value };
        url = `${this.BASE_URL}/trackingnumber/${shipment.id}`;
        break;

      case 'fromLocation': {
        const locationInfo = value as CentreLocationInfo;
        json = { ...json, locationId: locationInfo.locationId };
        url = `${this.BASE_URL}/fromlocation/${shipment.id}`;
        break;
      }

      case 'toLocation': {
        const locationInfo = value as CentreLocationInfo;
        json = { ...json, locationId: locationInfo.locationId };
        url = `${this.BASE_URL}/tolocation/${shipment.id}`;
        break;
      }

      case 'state':
        const stateChange = value as ShipmentStateChange;
        url = `${this.BASE_URL}/state/${stateChange.transition}/${shipment.id}`;
        switch (stateChange.transition) {
          case ShipmentStateTransision.SkipToSent:
            json = { ...json, timePacked: stateChange.datetime, timeSent: stateChange.skipDatetime };
            break;

          case ShipmentStateTransision.SkipToUnpacked:
            json = { ...json, timeReceived: stateChange.datetime, timeUnpacked: stateChange.skipDatetime };
            break;

          default:
            json = { ...json, datetime: stateChange.datetime };
        }
        break;

      default:
        throw new Error('invalid attribute name for update: ' + attributeName);
    }

    return this.http.post<ApiReply>(url, json).pipe(map(this.replyToShipment));
  }

  /**
   * Checks if a Specimen inventory ID can be added to a shipment. It can be added if:
   *
   *  - it belongs to a valid specimen
   *  - the specimen is located at the same location that the shipment is coming from
   *  - the specimen is not already part of the shipment
   */
  canAddSpecimen(inventoryId: string): Observable<Specimen> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/specimens/canadd/${inventoryId}`).pipe(
      // delay(2000),
      map(reply => {
        if (reply && reply.data) {
          return new Specimen().deserialize(reply.data as any);
        }
        throw new Error('expected a specimen object');
      })
    );
  }

  /**
   * Adds Specimens to a Shipment.
   */
  addSpecimens(
    shipment: Shipment,
    specimenInventoryIds: string[],
    shipmentContainerId?: string
  ): Observable<Shipment> {
    let json: any = { specimenInventoryIds: specimenInventoryIds };
    const url = `${this.BASE_URL}/specimens/${shipment.id}`;
    if (shipmentContainerId) {
      json = { ...json, shipmentContainerId };
    }
    return this.http.post<ApiReply>(url, json).pipe(map(this.replyToShipment));
  }

  /**
   * Updates the state of shipment specimens to be PRESENT.
   *
   * <p>Note that only specimens in unpacked shipments can have the state updated.
   */
  tagSpecimensAsPresent(shipment: Shipment, inventoryIds: string[]): Observable<Shipment> {
    return this.tagSpecimens(shipment, inventoryIds, ShipmentItemState.Present);
  }

  /**
   * Updates the state of shipment specimens to be RECEIVED.
   *
   * <p>Note that only specimens in unpacked shipments can have the state updated.
   */
  tagSpecimensAsReceived(shipment: Shipment, inventoryIds: string[]): Observable<Shipment> {
    return this.tagSpecimens(shipment, inventoryIds, ShipmentItemState.Received);
  }

  /**
   * Updates the state of shipment specimens to be MISSING.
   *
   * <p>Note that only specimens in unpacked shipments can have the state updated.
   */
  tagSpecimensAsMissing(shipment: Shipment, inventoryIds: string[]): Observable<Shipment> {
    return this.tagSpecimens(shipment, inventoryIds, ShipmentItemState.Missing);
  }

  /**
   * Updates the state of shipment specimens to be EXTRA.
   *
   * <p>Note that only specimens in unpacked shipments can have the state updated.
   */
  tagSpecimensAsExtra(shipment: Shipment, inventoryIds: string[]): Observable<Shipment> {
    return this.tagSpecimens(shipment, inventoryIds, ShipmentItemState.Extra);
  }

  /**
   * Removes this shipment from the system.
   */
  remove(shipment: Shipment): Observable<string> {
    const url = `${this.BASE_URL}/${shipment.id}/${shipment.version}`;
    return this.http.delete<ApiReply>(url).pipe(
      map((reply: ApiReply) => {
        if (reply && reply.data) {
          return shipment.id;
        }
        throw new Error('expected a valid reply');
      })
    );
  }

  private replyToShipment(reply: ApiReply): Shipment {
    if (reply && reply.data) {
      return new Shipment().deserialize(reply.data as any);
    }
    throw new Error('expected a shipment object');
  }

  private tagSpecimens(
    shipment: Shipment,
    specimenInventoryIds: string[],
    urlPath: string
  ): Observable<Shipment> {
    const json = { specimenInventoryIds };
    const url = `${this.BASE_URL}/specimens/${urlPath}/${shipment.id}`;
    return this.http.post<ApiReply>(url, json).pipe(map(this.replyToShipment));
  }
}
