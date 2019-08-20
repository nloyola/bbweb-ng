import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CentreLocationInfo } from '@app/domain/centres';
import { ModalInputBaseComponent } from '@app/modules/modals/components/modal-input-base.component';
import { RootStoreState } from '@app/root-store';
import { CentreLocationSelectTypeahead } from '@app/shared/typeaheads/centre-loction-select-typeahead';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
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
