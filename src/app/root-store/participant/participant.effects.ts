import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as ParticipantActions from './participant.actions';
import { ParticipantService, ParticipantUpdateAttribute } from '@app/core/services';
import { Participant } from '@app/domain/participants';
import { Specimen } from '@app/domain/participants';

@Injectable()
export class ParticipantStoreEffects {

  constructor(private actions$: Actions<ParticipantActions.ParticipantActionsUnion>,
              private participantService: ParticipantService) { }

  @Effect()
  getRequest$ = this.actions$.pipe(
    ofType(ParticipantActions.getParticipantRequest.type),
    map(action => action.slug),
    switchMap(
      slug => this.participantService.get(slug).pipe(
        map(participant => ParticipantActions.getParticipantSuccess({ participant })),
        catchError(error => observableOf(ParticipantActions.getParticipantFailure({ error }))))
    )
  );

  @Effect()
  addRequest$ = this.actions$.pipe(
    ofType(ParticipantActions.addParticipantRequest.type),
    switchMap(
      action =>
        this.participantService.add(action.participant).pipe(
          map(participant => ParticipantActions.addParticipantSuccess({ participant })),
          catchError(error => observableOf(ParticipantActions.addParticipantFailure({ error }))))
    )
  );

  @Effect()
  updateRequest$ = this.actions$.pipe(
    ofType(ParticipantActions.updateParticipantRequest.type),
    switchMap(
      action =>
        this.participantService.update(action.participant, action.attributeName, action.value).pipe(
          map(participant => ParticipantActions.updateParticipantSuccess({ participant })),
          catchError(error => observableOf(ParticipantActions.updateParticipantFailure({ error }))))
    )
  );

}
