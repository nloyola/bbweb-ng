import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Shipment } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreSelectors, ShipmentStoreActions } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CentreAddTypeahead } from '@app/shared/typeaheads/centre-add-typeahead';
import { Centre } from '@app/domain/centres';

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
  fromCentreTypeahead: CentreAddTypeahead;
  toCentreTypeahead: CentreAddTypeahead;
  isSaving$: Observable<boolean>;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.createFromCentreTypeahead();
    this.createToCentreTypeahead();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      courierName: ['', [Validators.required]],
      trackingNumber: ['', [Validators.required]],
      fromCentre: ['', [Validators.required]],
      toCentre: ['', [Validators.required]]
    });

    this.courierNameInput.nativeElement.focus();

    this.isSaving$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentLastAdded),
        filter(s => !!s),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((s: Shipment) => {
        this.toastr.success(`Shipment was added successfully: ${s.trackingNumber}`, 'Add Successfull');
        this.router.navigate(['..'], { relativeTo: this.route });
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

  get fromCentre() {
    return this.form.get('fromCentre');
  }

  get toCentre() {
    return this.form.get('toCentre');
  }

  onSubmit() {
    const shipment = new Shipment().deserialize(this.form.value);
    this.store$.dispatch(ShipmentStoreActions.addShipmentRequest({ shipment }));
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private createFromCentreTypeahead() {
    this.fromCentreTypeahead = new CentreAddTypeahead(this.store$, (centres: Centre[]) => {
      const toCentreId = this.toCentre.value;
      if (toCentreId !== undefined) {
        return centres.filter(entity => entity.id !== toCentreId);
      }
      return centres;
    });

    this.fromCentreTypeahead.selected$.pipe(takeUntil(this.unsubscribe$)).subscribe((centre: Centre) => {
      this.fromCentre.setValue(centre.id);
    });
  }

  private createToCentreTypeahead() {
    this.toCentreTypeahead = new CentreAddTypeahead(this.store$, (centres: Centre[]) => {
      const fromCentreId = this.fromCentre.value;
      if (fromCentreId !== undefined) {
        return centres.filter(entity => entity.id !== fromCentreId);
      }
      return centres;
    });

    this.toCentreTypeahead.selected$.pipe(takeUntil(this.unsubscribe$)).subscribe((centre: Centre) => {
      this.toCentre.setValue(centre.id);
    });
  }
}
