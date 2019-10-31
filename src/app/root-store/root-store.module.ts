import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AuthStoreReducer } from '@app/root-store/auth-store';
import { StudyStoreReducer } from '@app/root-store/study';
import { environment } from '@env/environment';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AuthStoreEffects } from './auth-store/auth-store.effects';
import { CentreStoreReducer } from './centre';
import { CentreStoreEffects } from './centre/centre.effects';
import { EventStoreReducer } from './event';
import { EventTypeStoreReducer } from './event-type';
import { EventTypeStoreEffects } from './event-type/event-type.effects';
import { EventStoreEffects } from './event/event.effects';
import { MembershipStoreReducer } from './membership';
import { MembershipStoreEffects } from './membership/membership.effects';
import { ParticipantStoreReducer } from './participant';
import { ParticipantStoreEffects } from './participant/participant.effects';
import { ProcessingTypeStoreReducer } from './processing-type';
import { ProcessingTypeStoreEffects } from './processing-type/processing-type.effects';
import { RoleStoreReducer } from './role';
import { RoleStoreEffects } from './role/role.effects';
import { ShipmentStoreReducer } from './shipment';
import { ShipmentSpecimenStoreReducer } from './shipment-specimen';
import { ShipmentSpecimenStoreEffects } from './shipment-specimen/shipment-specimen.effects';
import { ShipmentStoreEffects } from './shipment/shipment.effects';
import { SpecimenStoreReducer } from './specimen';
import { SpecimenStoreEffects } from './specimen/specimen.effects';
import { StudyStoreEffects } from './study/study.effects';
import { UserStoreReducer } from './user';
import { UserStoreEffects } from './user/user.effects';

export const NgrxRuntimeChecks = {
  runtimeChecks: {
    strictStateImmutability: false,
    strictActionImmutability: false,
    strictStateSerializability: false,
    strictActionSerializability: false
  }
};

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot({}, NgrxRuntimeChecks),
    StoreModule.forFeature('auth', AuthStoreReducer.reducer),
    StoreModule.forFeature('centre', CentreStoreReducer.reducer),
    StoreModule.forFeature('event', EventStoreReducer.reducer),
    StoreModule.forFeature('event-type', EventTypeStoreReducer.reducer),
    StoreModule.forFeature('membership', MembershipStoreReducer.reducer),
    StoreModule.forFeature('participant', ParticipantStoreReducer.reducer),
    StoreModule.forFeature('processing-type', ProcessingTypeStoreReducer.reducer),
    StoreModule.forFeature('role', RoleStoreReducer.reducer),
    StoreModule.forFeature('shipment', ShipmentStoreReducer.reducer),
    StoreModule.forFeature('shipment-specimen', ShipmentSpecimenStoreReducer.reducer),
    StoreModule.forFeature('specimen', SpecimenStoreReducer.reducer),
    StoreModule.forFeature('study', StudyStoreReducer.reducer),
    StoreModule.forFeature('user', UserStoreReducer.reducer),
    EffectsModule.forRoot([]),
    EffectsModule.forFeature([
      AuthStoreEffects,
      CentreStoreEffects,
      EventStoreEffects,
      EventTypeStoreEffects,
      MembershipStoreEffects,
      ParticipantStoreEffects,
      ProcessingTypeStoreEffects,
      RoleStoreEffects,
      ShipmentStoreEffects,
      ShipmentSpecimenStoreEffects,
      SpecimenStoreEffects,
      StudyStoreEffects,
      UserStoreEffects
    ]),
    StoreDevtoolsModule.instrument(),
    !environment.production ? StoreDevtoolsModule.instrument({ maxAge: 25 /* Retains last 25 states */ }) : []
  ],
  declarations: []
})
export class RootStoreModule {}
