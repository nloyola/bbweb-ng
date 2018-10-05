import {
  MatButtonModule,
  MatCheckboxModule,
  MatProgressBarModule
} from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressBarModule
  ],
  exports: [
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressBarModule
  ]
})
export class MaterialModule { }
