import { Participant } from '@app/domain/participants';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromParticipant from './participant.reducer';

export const getLastAddedId = (state: fromParticipant.State): string => state.lastAddedId;

export const getError = (state: fromParticipant.State): any => state.error;

export const selectParticipantState = createFeatureSelector<fromParticipant.State>('participant');

export const selectParticipantLastAddedId: MemoizedSelector<object, string> =
  createSelector(selectParticipantState, getLastAddedId);

export const selectParticipantError: MemoizedSelector<object, any> =
  createSelector(selectParticipantState, getError);

export const selectAllParticipants: MemoizedSelector<object, Participant[]> =
  createSelector(selectParticipantState, fromParticipant.selectAll);

export const selectAllParticipantEntities =
  createSelector(selectParticipantState, fromParticipant.selectEntities);

export const selectParticipantLastAdded =
  createSelector(
    selectParticipantLastAddedId,
    selectAllParticipantEntities,
    (id: string, entities: { [id: string]: Participant }): Participant => {
      return entities[id];
    });
