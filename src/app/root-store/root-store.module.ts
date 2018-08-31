import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AuthStoreReducer } from '@app/root-store/auth-store';

import { AuthStoreEffects } from './auth-store/auth-store.effects';
import { environment } from '../../environments/environment';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    StoreModule.forFeature('auth', AuthStoreReducer.reducer),
    EffectsModule.forFeature([AuthStoreEffects]),
    StoreDevtoolsModule.instrument(),
    !environment.production ?
      StoreDevtoolsModule.instrument({ maxAge: 25, /* Retains last 25 states */ })
      : [],
  ],
  declarations: []
})
export class RootStoreModule { }
