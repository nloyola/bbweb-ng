import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { SpinnerService } from '@app/core/services';

@Component({
  selector: 'app-spinner',
  template: `
    <ng-container *ngIf="show">
      <fa-icon [icon]="faSpinner" [spin]="true"></fa-icon>
      &nbsp;<ng-content></ng-content>
    </ng-container>`,
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit, OnDestroy {

  @Input() name: string;
  @Input() show: boolean;
  faSpinner = faSpinner;

  constructor(private spinnerService: SpinnerService) { }

  ngOnInit(): void {
    if (!this.name) { throw new Error('name must be specified'); }
    this.spinnerService.register(this);
  }

  ngOnDestroy(): void {
    this.spinnerService.remove(this.name);
  }

}
