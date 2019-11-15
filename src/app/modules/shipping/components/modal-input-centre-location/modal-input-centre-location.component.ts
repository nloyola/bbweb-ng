import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CentreLocationInfo } from '@app/domain/centres';
import { ModalInputComponent } from '@app/modules/modals/components/modal-input.component';
import { RootStoreState } from '@app/root-store';
import { CentreLocationSelectTypeahead } from '@app/shared/typeaheads/centre-loction-select-typeahead';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-modal-input-centre-location',
  templateUrl: './modal-input-centre-location.component.html',
  styleUrls: ['./modal-input-centre-location.component.scss']
})
export class ModalInputCentreLocationComponent extends ModalInputComponent<CentreLocationInfo>
  implements OnInit, OnDestroy {
  @Input() locationIdToFilterOut: string;

  form: FormGroup;
  locationTypeahead: CentreLocationSelectTypeahead;
  modalInputValid = false;

  constructor(formBuilder: FormBuilder, private store$: Store<RootStoreState.State>) {
    super(formBuilder);
    this.validators = [Validators.required];
    this.createCentreTypeahead();
  }

  ngOnInit() {
    super.ngOnInit();
    this.locationTypeahead.selectedEntity = this.value;
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private createCentreTypeahead() {
    const resultsMapper = (centreLocations: CentreLocationInfo[]) => {
      if (centreLocations.length <= 0) {
        this.modalInputValid = false;
      } else {
        return centreLocations.filter(
          centreLocationInfo => centreLocationInfo.location.id !== this.locationIdToFilterOut
        );
      }
      return centreLocations;
    };

    this.locationTypeahead = new CentreLocationSelectTypeahead(this.store$, resultsMapper);

    this.locationTypeahead.selected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((locationInfo: CentreLocationInfo) => {
        this.input.setValue(locationInfo);
        this.modalInputValid = true;
      });
  }
}
