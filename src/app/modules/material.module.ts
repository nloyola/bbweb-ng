import {
  MatButtonModule,
  MatCheckboxModule,
  MatProgressSpinnerModule
} from '@angular/material';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule],
  exports: [MatButtonModule, MatCheckboxModule, MatIconModule, MatProgressSpinnerModule]
})
export class MaterialModule { }
