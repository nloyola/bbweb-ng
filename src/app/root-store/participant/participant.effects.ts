import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as ParticipantActions from './participant.actions';
import { ParticipantService, ParticipantUpdateAttribute } from '@app/core/services';
import { Participant } from '@app/domain/participants';
import { Specimen } from '@app/domain/participants';

@Injectable()
export class ParticipantStoreEffects {
  constructor(
    private actions$: Actions<ParticipantActions.ParticipantActionsUnion>,
    private participantService: ParticipantService
  ) {}

  @Effect()
  getRequest$ = this.actions$.pipe(
    ofType(ParticipantActions.getParticipantRequest.type),
    switchMap(action => {
      let result: Observable<Participant>;
      if (action.slug) {
        result = this.participantService.get(action.slug);
      } else if (action.uniqueId) {
        result = this.participantService.getByUniqueId(action.uniqueId);
      } else {
        const error = { message: 'invalid action parameters' };
        return observableOf(ParticipantActions.getParticipantFailure({ error }));
      }

      return result.pipe(
        map(participant => ParticipantActions.getParticipantSuccess({ participant })),
        catchError(error => observableOf(ParticipantActions.getParticipantFailure({ error })))
      );
    })
  );

  @Effect()
  addRequest$ = this.actions$.pipe(
    ofType(ParticipantActions.addParticipantRequest.type),
    switchMap(action =>
      this.participantService.add(action.participant).pipe(
        map(participant => ParticipantActions.addParticipantSuccess({ participant })),
        catchError(error => observableOf(ParticipantActions.addParticipantFailure({ error })))
      )
    )
  );

  @Effect()
  updateRequest$ = this.actions$.pipe(
    ofType(ParticipantActions.updateParticipantRequest.type),
    switchMap(action =>
      this.participantService.update(action.participant, action.attributeName, action.value).pipe(
        map(participant => ParticipantActions.updateParticipantSuccess({ participant })),
        catchError(error => observableOf(ParticipantActions.updateParticipantFailure({ error })))
      )
    )
  );
}
