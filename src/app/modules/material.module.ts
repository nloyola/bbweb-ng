import {
  MatButtonModule,
  MatCheckboxModule,
  MatProgressBarModule,
  MatStepperModule
} from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressBarModule,
    MatStepperModule
  ],
  exports: [
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressBarModule,
    MatStepperModule
  ]
})
export class MaterialModule { }
