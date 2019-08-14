import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CentreLocationInfo } from '@app/domain/centres';
import { Shipment, ShipmentState } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreSelectors, ShipmentStoreActions } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import {
  CentreLocationResultsMapper,
  CentreLocationSelectTypeahead
} from '@app/shared/typeaheads/centre-loction-select-typeahead';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ModalInputBaseComponent } from '@app/modules/modals/components/modal-input-base.component';
@Component({
  selector: 'app-modal-input-centre-location',
  templateUrl: './modal-input-centre-location.component.html',
  styleUrls: ['./modal-input-centre-location.component.scss']
})
export class ModalInputCentreLocationComponent extends ModalInputBaseComponent<CentreLocationInfo>
  implements OnInit, OnDestroy {
  @Input() locationIdToFilterOut: string;

  form: FormGroup;
  locationInfoTypeahead: CentreLocationSelectTypeahead;
  modalInputValid = false;

  constructor(formBuilder: FormBuilder, private store$: Store<RootStoreState.State>) {
    super(formBuilder);
    this.createCentreTypeahead();
  }

  ngOnInit() {
    super.ngOnInit();
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private createCentreTypeahead() {
    const resultsMapper = (centreLocations: CentreLocationInfo[]) => {
      this.input.markAsTouched();
      if (centreLocations.length <= 0) {
        this.input.setValue('');
        this.modalInputValid = false;
      } else {
        return centreLocations.filter(
          centreLocationInfo => centreLocationInfo.locationId !== this.locationIdToFilterOut
        );
      }
      return centreLocations;
    };

    this.locationInfoTypeahead = new CentreLocationSelectTypeahead(this.store$, resultsMapper);

    this.locationInfoTypeahead.selected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((centreLocationInfo: CentreLocationInfo) => {
        this.input.setValue(centreLocationInfo);
        this.modalInputValid = true;
      });
  }
}
