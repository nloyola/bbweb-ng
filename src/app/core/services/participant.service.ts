import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JSONObject } from '@app/domain';
import { ApiReply } from '@app/domain/api-reply.model';
import { Participant } from '@app/domain/participants';
import { Observable } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export type ParticipantUpdateAttribute =
  'uniqueId'
  | 'addAnnotation'
  | 'removeAnnotation';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {

  readonly BASE_URL = '/api/participants';

  constructor(private http: HttpClient) {}

  /**
   * Retrieves a Participant from the server.
   */
  get(slug: string): Observable<Participant> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/${slug}`).pipe(
      // delay(2000),
      map(this.replyToParticipant));
  }

  getByUniqueId(uniqueId: string): Observable<Participant> {
    return this.http.get<ApiReply>(`${this.BASE_URL}/uniqueId/${uniqueId}`).pipe(
      // delay(2000),
      map(this.replyToParticipant));
  }

  add(participant: Participant): Observable<Participant> {
    const annotations = participant.annotations.map(a => a.serverAnnotation());
    const json = {
      uniqueId: participant.uniqueId,
      annotations
    };
    return this.http.post<ApiReply>(`${this.BASE_URL}/${participant.study.id}`, json).pipe(
      // delay(2000),
      map(this.replyToParticipant));
  }

  update(
    participant: Participant,
    attributeName: ParticipantUpdateAttribute,
    value: any
  ): Observable<Participant> {
    let url: string;
    let json = { expectedVersion: participant.version };

    switch (attributeName) {
      case 'uniqueId':
        json = { ...json, uniqueId: value } as any;
        url = `${this.BASE_URL}/uniqueId/${participant.id}`;
        break;

      case 'addAnnotation':
        json = { ...json, ...value } as any;
        url = `${this.BASE_URL}/annot/${participant.id}`;
        break;

      case 'removeAnnotation':
        url = `${this.BASE_URL}/annot/${participant.id}/${participant.version}/${value}`;
        break;

      default:
        throw new Error('invalid attribute name for update: ' + attributeName);
    }

    if (attributeName === 'removeAnnotation') {
      return this.http.delete<ApiReply>(url).pipe(map(this.replyToParticipant));
    }
    return this.http.post<ApiReply>(url, json).pipe(map(this.replyToParticipant));
  }

  private replyToParticipant(reply: ApiReply): Participant {
    if (reply && reply.data) {
      return new Participant().deserialize(reply.data as JSONObject);
    }
    throw new Error('expected a participant object');
  }
}
