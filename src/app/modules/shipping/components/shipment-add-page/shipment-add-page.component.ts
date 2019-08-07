import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Centre } from '@app/domain/centres';
import { Shipment } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { CentreSelectTypeahead, CentreResultsMapper } from '@app/shared/typeaheads';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

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
  fromCentreTypeahead: CentreSelectTypeahead;
  toCentreTypeahead: CentreSelectTypeahead;
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
      fromCentre: ['', [Validators.required]],
      toCentre: ['', [Validators.required]]
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
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private createFromCentreTypeahead() {
    const centreIdToFilterFn = () =>
      this.toCentreTypeahead.selectedEntity !== undefined
        ? this.toCentreTypeahead.selectedEntity.id
        : undefined;
    const resultsMapper = this.resultMapperForCentreControl(this.fromCentre, centreIdToFilterFn);
    this.fromCentreTypeahead = new CentreSelectTypeahead(this.store$, resultsMapper);

    this.fromCentreTypeahead.selected$.pipe(takeUntil(this.unsubscribe$)).subscribe((centre: Centre) => {
      this.fromCentre.setValue(centre.id);
    });
  }

  private createToCentreTypeahead() {
    const centreIdToFilterFn = () =>
      this.fromCentreTypeahead.selectedEntity !== undefined
        ? this.fromCentreTypeahead.selectedEntity.id
        : undefined;
    const resultsMapper = this.resultMapperForCentreControl(this.toCentre, centreIdToFilterFn);
    this.toCentreTypeahead = new CentreSelectTypeahead(this.store$, resultsMapper);

    this.toCentreTypeahead.selected$.pipe(takeUntil(this.unsubscribe$)).subscribe((centre: Centre) => {
      this.toCentre.setValue(centre.id);
    });
  }

  private resultMapperForCentreControl(
    formControl: AbstractControl,
    centreToFilterFn: () => String
  ): CentreResultsMapper {
    return (centres: Centre[]) => {
      formControl.markAsTouched();
      if (centres.length <= 0) {
        formControl.setValue('');
      } else {
        const centreToFilterId = centreToFilterFn();
        if (centreToFilterId !== undefined) {
          return centres.filter(entity => entity.id !== centreToFilterId);
        }
      }
      return centres;
    };
  }
}
