import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JSONArray, JSONObject, SearchParams, PagedReply } from '@app/domain';
import { ApiReply } from '@app/domain/api-reply.model';
import { Specimen, CollectionEvent } from '@app/domain/participants';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SpecimenService {

  readonly BASE_URL = '/api/participants/cevents/spcs';

  constructor(private http: HttpClient) {}

  /**
   * Retrieves a Specimen from the server.
   */
  get(slug: string): Observable<Specimen> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${slug}`)
      .pipe(map(this.replyToSpecimen));
  }

  /**
   * Used to search for Specimens.
   */
  search(event: CollectionEvent, searchParams: SearchParams): Observable<PagedReply<Specimen>> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${event.slug}`,
                                   { params: searchParams.httpParams() })
      .pipe(
        // delay(1000),
        map((reply: ApiReply) => {
          const jObj = reply.data as JSONObject;
          if (reply && reply.data && jObj.items) {
            const entities: Specimen[] = (jObj.items as JSONArray)
              .map((obj: JSONObject) => new Specimen().deserialize(obj as any));

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

  add(event: CollectionEvent, specimens: Specimen[]): Observable<CollectionEvent> {
    const json = {
      collectionEventId: event.id,
      specimenData: specimens.map(spc => ({
        inventoryId:          spc.inventoryId,
        specimenDefinitionId: spc.specimenDefinitionId,
        timeCreated:          spc.timeCreated,
        amount:               spc.amount
      }))
    };
    return this.http.post<ApiReply>(`${this.BASE_URL}/`, json).pipe(
      // delay(2000),
      map(this.replyToCollectionEvent));
  }

  remove(specimen: Specimen): Observable<string> {
    const url = `${this.BASE_URL}/${specimen.eventId}/${specimen.id}/${specimen.version}`;
    return this.http.delete<ApiReply>(url)
      .pipe(map((reply: ApiReply) => {
        if (reply && reply.data) {
          return specimen.id;
        }
        throw new Error('expected a valid reply');
      }));
  }

  private replyToSpecimen(reply: ApiReply): Specimen {
    if (reply && reply.data) {
      return new Specimen().deserialize(reply.data as any);
    }
    throw new Error('expected a specimen object');
  }

  private replyToCollectionEvent(reply: ApiReply): CollectionEvent {
    if (reply && reply.data) {
      return new CollectionEvent().deserialize(reply.data as any);
    }
    throw new Error('expected a collectionEvent object');
  }
}
