import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-shipment-add-page',
  templateUrl: './shipment-add-page.component.html',
  styleUrls: ['./shipment-add-page.component.scss']
})
export class ShipmentAddPageComponent implements OnInit, OnDestroy {
  @ViewChild('courierNameInput', { static: true }) courierNameInput: ElementRef;
  @ViewChild('trackingNumberInput', { static: true }) trackingNumberInput: ElementRef;
  @ViewChild('fromCentreInput', { static: true }) fromCentreInput: ElementRef;
  @ViewChild('toCentreInput', { static: true }) toCentreInput: ElementRef;

  form: FormGroup;
  fromLocationInfoTypeahead: CentreLocationSelectTypeahead;
  toLocationInfoTypeahead: CentreLocationSelectTypeahead;
  isSaving$: Observable<boolean>;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.form = this.formBuilder.group({
      courierName: ['', [Validators.required]],
      trackingNumber: ['', [Validators.required]],
      fromLocationInfo: ['', [Validators.required]],
      toLocationInfo: ['', [Validators.required]]
    });

    this.createFromCentreTypeahead();
    this.createToCentreTypeahead();
  }

  ngOnInit() {
    this.courierNameInput.nativeElement.focus();

    this.isSaving$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentLastAdded),
        filter(s => !!s),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((shipment: Shipment) => {
        this.toastr.success(`Shipment was added successfully: ${shipment.trackingNumber}`, 'Add Successfull');
        this.router.navigate(['/shipping/add-items', shipment.id]);
        this.store$.dispatch(ShipmentStoreActions.clearLastAdded());
      });

    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentError),
        filter(s => !!s),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((error: any) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        // if (errMessage.match(/EntityCriteriaError: name already used/)) {
        //   errMessage = `A study with the name ${this.name.value} already exits. Please use a different one.`;
        // }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
      });
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get courierName() {
    return this.form.get('courierName');
  }

  get trackingNumber() {
    return this.form.get('trackingNumber');
  }

  get fromLocationInfo() {
    return this.form.get('fromLocationInfo');
  }

  get toLocationInfo() {
    return this.form.get('toLocationInfo');
  }

  onSubmit() {
    const shipment = new Shipment().deserialize({
      ...this.form.value,
      state: ShipmentState.Created
    });
    this.store$.dispatch(ShipmentStoreActions.addShipmentRequest({ shipment }));
  }

  onCancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private createFromCentreTypeahead() {
    const locationIdToFilterFn = () =>
      this.toLocationInfoTypeahead.selectedEntity !== undefined
        ? this.toLocationInfoTypeahead.selectedEntity
        : undefined;
    const resultsMapper = this.resultMapperForCentreControl(this.fromLocationInfo, locationIdToFilterFn);
    this.fromLocationInfoTypeahead = new CentreLocationSelectTypeahead(this.store$, resultsMapper);

    this.fromLocationInfoTypeahead.selected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((centreLocationInfo: CentreLocationInfo) => {
        this.fromLocationInfo.setValue(centreLocationInfo);
      });
  }

  private createToCentreTypeahead() {
    const locationIdToFilterFn = () =>
      this.fromLocationInfoTypeahead.selectedEntity !== undefined
        ? this.fromLocationInfoTypeahead.selectedEntity
        : undefined;
    const resultsMapper = this.resultMapperForCentreControl(this.toLocationInfo, locationIdToFilterFn);
    this.toLocationInfoTypeahead = new CentreLocationSelectTypeahead(this.store$, resultsMapper);

    this.toLocationInfoTypeahead.selected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((centreLocationInfo: CentreLocationInfo) => {
        this.toLocationInfo.setValue(centreLocationInfo);
      });
  }

  private resultMapperForCentreControl(
    formControl: AbstractControl,
    locationToFilterFn: () => CentreLocationInfo
  ): CentreLocationResultsMapper {
    return (centreLocations: CentreLocationInfo[]) => {
      formControl.markAsTouched();
      if (centreLocations.length <= 0) {
        formControl.setValue('');
      } else {
        const locationToFilter = locationToFilterFn();
        const locationToFilterId = locationToFilter === undefined ? undefined : locationToFilter.locationId;
        if (locationToFilterId !== undefined) {
          return centreLocations.filter(
            centreLocationInfo => centreLocationInfo.locationId !== locationToFilterId
          );
        }
      }
      return centreLocations;
    };
  }

  stepClick(event: StepperSelectionEvent) {
    if (event.selectedIndex < 3) {
      return;
    } else {
    }
  }
}
