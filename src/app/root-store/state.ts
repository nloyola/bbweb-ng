import { AuthStoreReducer } from '@app/root-store/auth-store';
import { StudyStoreReducer } from './study';
import { EventTypeStoreReducer } from './event-type';
import { ProcessingTypeStoreReducer } from './processing-type';
import { SpinnerStoreReducer } from './spinner';
import { CentreStoreReducer } from './centre';
import { EventStoreReducer } from './event';
import { ParticipantStoreReducer } from './participant';
import { MembershipStoreReducer } from './membership';
import { RoleStoreReducer } from './role';
import { ShipmentStoreReducer } from './shipment';
import { ShipmentSpecimenStoreReducer } from './shipment-specimen';
import { SpecimenStoreReducer } from './specimen';
import { UserStoreReducer } from './user';

export interface State {
  auth: AuthStoreReducer.State;
  centre: CentreStoreReducer.State;
  event: EventStoreReducer.State;
  'event-type': EventTypeStoreReducer.State;
  membership: MembershipStoreReducer.State;
  participant: ParticipantStoreReducer.State;
  'processing-type': ProcessingTypeStoreReducer.State;
  role: RoleStoreReducer.State;
  shipment: ShipmentStoreReducer.State;
  'shipemnt-specimen': ShipmentSpecimenStoreReducer.State;
  specimen: SpecimenStoreReducer.State;
  spinner: SpinnerStoreReducer.State;
  study: StudyStoreReducer.State;
  user: UserStoreReducer.State;
}
