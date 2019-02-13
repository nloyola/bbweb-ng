import { AuthStoreReducer } from '@app/root-store/auth-store';
import { StudyStoreReducer } from './study';
import { EventTypeStoreReducer } from './event-type';
import { ProcessingTypeStoreReducer } from './processing-type';
import { SpinnerStoreReducer } from './spinner';
import { CentreStoreReducer } from './centre';

export interface State {

  'auth': AuthStoreReducer.State;
  'centre': CentreStoreReducer.State;
  'study': StudyStoreReducer.State;
  'event-type': EventTypeStoreReducer.State;
  'processing-type': ProcessingTypeStoreReducer.State;
  'spinner': SpinnerStoreReducer.State;

}
