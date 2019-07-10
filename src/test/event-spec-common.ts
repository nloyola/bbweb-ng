import { Study, CollectionEventType } from '@app/domain/studies';
import { Participant, CollectionEvent, Specimen } from '@app/domain/participants';
import { Store } from '@ngrx/store';
import { StudyStoreActions, EventTypeStoreActions, ParticipantStoreActions, SpecimenStoreActions, EventStoreActions, RootStoreState } from '@app/root-store';
import { Factory } from './factory';

export namespace EventSpecCommon {

  export interface EntitiesOptions {
    study?: Study;
    eventType?: CollectionEventType;
    participant?: Participant;
    event?: CollectionEvent;
    specimen?: Specimen;
  }

  export function createEntities(options: EntitiesOptions = {}, factory: Factory): EntitiesOptions {
    const study = (options.study !== undefined) ? options.study : new Study().deserialize(factory.study());
    const eventType = (options.eventType !== undefined)
      ? options.eventType : new CollectionEventType().deserialize(factory.collectionEventType({
        annotationTypes: [ factory.annotationType() ]
      }));
    const participant = (options.participant !== undefined)
      ?  options.participant : new Participant().deserialize(factory.participant());
    const event = (options.event !== undefined)
      ? options.event : new CollectionEvent().deserialize(factory.collectionEvent());
    const specimen = (options.specimen !== undefined)
      ? options.specimen : new Specimen().deserialize(factory.specimen());
    return { study, participant, eventType, event, specimen };
  }

  export function dispatchEntities(options: EntitiesOptions = {}, store: Store<RootStoreState.State>) {
    const { study, eventType, participant, event, specimen } = options;
    if (study) { store.dispatch(StudyStoreActions.getStudySuccess({ study })); }

    if (eventType) { store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType })); }

    if (participant) { store.dispatch(ParticipantStoreActions.getParticipantSuccess({ participant })); }

    if (event) { store.dispatch(EventStoreActions.getEventSuccess({ event })); }

    if (specimen) { store.dispatch(SpecimenStoreActions.getSpecimenSuccess({ specimen })); }
  }

}
