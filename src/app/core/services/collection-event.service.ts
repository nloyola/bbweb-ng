import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JSONArray, JSONObject, SearchParams, PagedReply, searchParamsToHttpParams } from '@app/domain';
import { ApiReply } from '@app/domain/api-reply.model';
import { CollectionEvent, Participant } from '@app/domain/participants';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export type CollectionEventUpdateAttribute =
  | 'visitNumber'
  | 'timeCompleted'
  | 'addOrUpdateAnnotation'
  | 'removeAnnotation';

@Injectable({
  providedIn: 'root'
})
export class CollectionEventService {
  readonly BASE_URL = '/api/participants/cevents';

  constructor(private http: HttpClient) {}

  /**
   * Retrieves a CollectionEvent from the server.
   */
  get(slug: string): Observable<CollectionEvent> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${slug}`).pipe(map(this.replyToCollectionEvent));
  }

  getByVisitNumber(participant: Participant, visitNumber: number): Observable<CollectionEvent> {
    return this.http
      .get<ApiReply>(`${this.BASE_URL}/visitNumber/${participant.id}/${visitNumber}`)
      .pipe(map(this.replyToCollectionEvent));
  }

  /**
   * Used to search for CollectionEvents.
   */
  search(participant: Participant, searchParams: SearchParams): Observable<PagedReply<CollectionEvent>> {
    let params = searchParamsToHttpParams(searchParams);
    return this.http.get<ApiReply>(`${this.BASE_URL}/list/${participant.id}`, { params }).pipe(
      // delay(1000),
      map((reply: ApiReply) => {
        const jObj = reply.data as JSONObject;
        if (reply && reply.data && jObj.items) {
          const entities: CollectionEvent[] = (jObj.items as JSONArray).map((obj: any) =>
            new CollectionEvent().deserialize(obj)
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

  add(event: CollectionEvent): Observable<CollectionEvent> {
    const annotations = event.annotations.map(a => a.serverAnnotation());
    const json = {
      collectionEventTypeId: event.eventTypeId,
      timeCompleted: event.timeCompleted,
      visitNumber: event.visitNumber,
      annotations
    };
    return this.http.post<ApiReply>(`${this.BASE_URL}/${event.participantId}`, json).pipe(
      // delay(2000),
      map(this.replyToCollectionEvent)
    );
  }

  update(
    collectionEvent: CollectionEvent,
    attributeName: CollectionEventUpdateAttribute,
    value: any
  ): Observable<CollectionEvent> {
    if (collectionEvent === undefined) {
      throw new Error('collection event is undefined');
    }

    let url: string;
    let json = { expectedVersion: collectionEvent.version };

    switch (attributeName) {
      case 'visitNumber':
        json = { ...json, visitNumber: value } as any;
        url = `${this.BASE_URL}/visitNumber/${collectionEvent.id}`;
        break;

      case 'timeCompleted':
        json = { ...json, timeCompleted: value } as any;
        url = `${this.BASE_URL}/timeCompleted/${collectionEvent.id}`;
        break;

      case 'addOrUpdateAnnotation':
        json = { ...json, ...value } as any;
        url = `${this.BASE_URL}/annot/${collectionEvent.id}`;
        break;

      case 'removeAnnotation':
        url = `${this.BASE_URL}/annot/${collectionEvent.id}/${collectionEvent.version}/${value}`;
        break;

      default:
        throw new Error('invalid attribute name for update: ' + attributeName);
    }

    if (attributeName === 'removeAnnotation') {
      return this.http.delete<ApiReply>(url).pipe(map(this.replyToCollectionEvent));
    }
    return this.http.post<ApiReply>(url, json).pipe(map(this.replyToCollectionEvent));
  }

  remove(event: CollectionEvent): Observable<string> {
    const url = `${this.BASE_URL}/${event.participantId}/${event.id}/${event.version}`;
    return this.http.delete<ApiReply>(url).pipe(
      map((reply: ApiReply) => {
        if (reply && reply.data) {
          return event.id;
        }
        throw new Error('expected a valid reply');
      })
    );
  }

  private replyToCollectionEvent(reply: ApiReply): CollectionEvent {
    if (reply && reply.data) {
      return new CollectionEvent().deserialize(reply.data as any);
    }
    throw new Error('expected a collectionEvent object');
  }
}
