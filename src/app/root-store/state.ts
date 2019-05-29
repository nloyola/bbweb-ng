import { AuthStoreReducer } from '@app/root-store/auth-store';
import { StudyStoreReducer } from './study';
import { EventTypeStoreReducer } from './event-type';
import { ProcessingTypeStoreReducer } from './processing-type';
import { SpinnerStoreReducer } from './spinner';
import { CentreStoreReducer } from './centre';
import { EventStoreReducer } from './event';
import { ParticipantStoreReducer } from './participant';

export interface State {

  'auth': AuthStoreReducer.State;
  'centre': CentreStoreReducer.State;
  'event-type': EventTypeStoreReducer.State;
  'event': EventStoreReducer.State;
  'participant': ParticipantStoreReducer.State;
  'processing-type': ProcessingTypeStoreReducer.State;
  'spinner': SpinnerStoreReducer.State;
  'study': StudyStoreReducer.State;

}
