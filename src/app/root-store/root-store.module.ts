import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AuthStoreReducer } from '@app/root-store/auth-store';
import { StudyStoreReducer } from '@app/root-store/study';

import { AuthStoreEffects } from './auth-store/auth-store.effects';
import { StudyStoreEffects } from './study/study.effects';
import { environment } from '@env/environment';
import { SpinnerEffects } from './spinner/spinner.effects';
import { SpinnerStoreReducer } from '@app/root-store/spinner';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    StoreModule.forFeature('auth', AuthStoreReducer.reducer),
    StoreModule.forFeature('study', StudyStoreReducer.reducer),
    StoreModule.forFeature('spinner', SpinnerStoreReducer.reducer),
    EffectsModule.forFeature([
      AuthStoreEffects,
      StudyStoreEffects,
      SpinnerEffects
    ]),
    StoreDevtoolsModule.instrument(),
    !environment.production ?
      StoreDevtoolsModule.instrument({ maxAge: 25, /* Retains last 25 states */ })
      : [],
  ],
  declarations: []
})
export class RootStoreModule { }
