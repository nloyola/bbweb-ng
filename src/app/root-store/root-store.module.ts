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
import { EventTypeStoreReducer } from './event-type';
import { EventTypeStoreEffects } from './event-type/event-type.effects';
import { ProcessingTypeStoreReducer } from './processing-type';
import { ProcessingTypeStoreEffects } from './processing-type/processing-type.effects';
import { SpinnerStoreReducer } from './spinner';
import { SpinnerEffects } from './spinner/spinner.effects';
import { StudyStoreEffects } from './study/study.effects';
import { UserStoreReducer } from './user';
import { UserStoreEffects } from './user/user.effects';
import { RoleStoreReducer } from './role';
import { RoleStoreEffects } from './role/role.effects';
import { MembershipStoreEffects } from './membership/membership.effects';
import { MembershipStoreReducer } from './membership';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot({}),
    StoreModule.forFeature('auth', AuthStoreReducer.reducer),
    StoreModule.forFeature('centre', CentreStoreReducer.reducer),
    StoreModule.forFeature('event-type', EventTypeStoreReducer.reducer),
    StoreModule.forFeature('membership', MembershipStoreReducer.reducer),
    StoreModule.forFeature('processing-type', ProcessingTypeStoreReducer.reducer),
    StoreModule.forFeature('role', RoleStoreReducer.reducer),
    StoreModule.forFeature('spinner', SpinnerStoreReducer.reducer),
    StoreModule.forFeature('study', StudyStoreReducer.reducer),
    StoreModule.forFeature('user', UserStoreReducer.reducer),
    EffectsModule.forRoot([]),
    EffectsModule.forFeature([
      AuthStoreEffects,
      CentreStoreEffects,
      EventTypeStoreEffects,
      MembershipStoreEffects,
      ProcessingTypeStoreEffects,
      RoleStoreEffects,
      SpinnerEffects,
      StudyStoreEffects,
      UserStoreEffects
    ]),
    StoreDevtoolsModule.instrument(),
    !environment.production ?
      StoreDevtoolsModule.instrument({ maxAge: 25, /* Retains last 25 states */ })
      : [],
  ],
  declarations: []
})
export class RootStoreModule { }
