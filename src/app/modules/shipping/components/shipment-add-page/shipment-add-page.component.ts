import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@app/core/services';
import { CentreLocationInfo } from '@app/domain/centres';
import { Shipment, ShipmentState } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import {
  CentreLocationSelectTypeahead,
  CentreLocationResultsMapper
} from '@app/shared/typeaheads/centre-location-select-typeahead';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-shipment-add-page',
  templateUrl: './shipment-add-page.component.html',
  styleUrls: ['./shipment-add-page.component.scss']
})
export class ShipmentAddPageComponent implements OnInit, OnDestroy {
  @ViewChild('courierNameInput', { static: true }) courierNameInput: ElementRef;
  @ViewChild('trackingNumberInput', { static: true }) trackingNumberInput: ElementRef;
  @ViewChild('originInput', { static: true }) originInput: ElementRef;
  @ViewChild('destinationInput', { static: true }) destinationInput: ElementRef;

  form: FormGroup;
  originTypeahead: CentreLocationSelectTypeahead;
  destinationTypeahead: CentreLocationSelectTypeahead;
  isSaving = false;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.form = this.formBuilder.group({
      courierName: ['', [Validators.required]],
      trackingNumber: ['', [Validators.required]],
      origin: ['', [Validators.required]],
      destination: ['', [Validators.required]]
    });

    this.createOriginTypeahead();
    this.createDestinationTypeahead();
  }

  ngOnInit() {
    this.courierNameInput.nativeElement.focus();

    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentLastAdded),
        filter((s) => !!s && this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((shipment: Shipment) => {
        this.notificationService.show();
        this.router.navigate(['/shipping', shipment.origin.slug, 'outgoing', 'view', shipment.id]);
        this.store$.dispatch(ShipmentStoreActions.clearLastAdded());
      });

    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentError),
        filter((s) => !!s && this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((error) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage.match(/EntityCriteriaError: shipment with tracking number already exists/)) {
          errMessage = `That Tracking Number is already in use by another shipment.`;
        }
        this.notificationService.showError(errMessage, 'Add Error');
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

  get origin() {
    return this.form.get('origin');
  }

  get destination() {
    return this.form.get('destination');
  }

  onSubmit() {
    const shipment = new Shipment().deserialize({
      ...this.form.value,
      state: ShipmentState.Created
    });
    this.store$.dispatch(ShipmentStoreActions.addShipmentRequest({ shipment }));
    this.notificationService.add(
      `Shipment was added successfully: ${shipment.trackingNumber}`,
      'Add Successfull'
    );
    this.isSaving = true;
  }

  onCancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private createOriginTypeahead() {
    const locationIdToFilterFn = () =>
      this.destination.value ? this.destination.value.location.id : undefined;
    const resultsMapper = this.resultMapperForCentreControl(locationIdToFilterFn);
    this.originTypeahead = new CentreLocationSelectTypeahead(this.store$, resultsMapper);

    this.originTypeahead.selected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((locationInfo: CentreLocationInfo) => {
        this.origin.setValue(locationInfo);
      });
  }

  private createDestinationTypeahead() {
    const locationIdToFilterFn = () => (this.origin.value ? this.origin.value.location.id : undefined);
    const resultsMapper = this.resultMapperForCentreControl(locationIdToFilterFn);
    this.destinationTypeahead = new CentreLocationSelectTypeahead(this.store$, resultsMapper);

    this.destinationTypeahead.selected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((locationInfo: CentreLocationInfo) => {
        this.destination.setValue(locationInfo);
      });
  }

  private resultMapperForCentreControl(locationIdToFilterFn: () => string): CentreLocationResultsMapper {
    return (locations: CentreLocationInfo[]) => {
      if (locations.length <= 0) {
        return;
      }

      const locationToFilterId = locationIdToFilterFn();
      if (locationToFilterId !== undefined) {
        return locations.filter((info) => info.location.id !== locationToFilterId);
      }
      return locations;
    };
  }
}
