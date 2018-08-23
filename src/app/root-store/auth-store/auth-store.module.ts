import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { UserLoginStoreEffects } from './effects';
import { featureReducer } from './reducer';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('userLogin', featureReducer),
    EffectsModule.forFeature([UserLoginStoreEffects])
  ],
  providers: [UserLoginStoreEffects]
})
export class AuthStoreModule { }
