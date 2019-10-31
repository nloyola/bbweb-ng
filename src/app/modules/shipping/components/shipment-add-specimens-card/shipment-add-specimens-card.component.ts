import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Shipment } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-shipment-add-specimens-card',
  templateUrl: './shipment-add-specimens-card.component.html',
  styleUrls: ['./shipment-add-specimens-card.component.scss']
})
export class ShipmentAddSpecimensCardComponent implements OnInit, OnDestroy {
  @ViewChild('addSpecimenError', { static: false }) addSpecimenError: TemplateRef<any>;
  @Input() shipment: Shipment;

  faVial = faVial;
  isLoading$: Observable<boolean>;
  shipmentLoading$ = new BehaviorSubject<boolean>(true);
  shipment$: Observable<Shipment>;
  specimenCount: number;
  form: FormGroup;
  inputInventoryIds = [];
  existingInventoryIds = [];
  addErrorMessage = '';

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.specimenCount = this.shipment.specimenCount;
    this.form = this.formBuilder.group({
      inventoryIds: ['', [Validators.required]]
    });

    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentError),
        filter(error => !!error),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(error => {
        if (
          error.actionType === ShipmentStoreActions.addSpecimensFailure.type &&
          error.error instanceof HttpErrorResponse
        ) {
          const errorMessage = error.error.error.message;
          const inventoryIds = errorMessage.split(': ');

          if (errorMessage.match(/invalid specimen inventory IDs/)) {
            this.addErrorMessage = `Inventory IDs not present in the system:<br><b>${inventoryIds[2]}</b>`;
          } else if (errorMessage.match(/specimens are already in an active shipment/)) {
            this.addErrorMessage = `Inventory IDs already in this shipment or another shipment:<br><b>${inventoryIds[2]}</b>`;
          } else if (errorMessage.match(/invalid centre for specimen inventory IDs/)) {
            this.addErrorMessage = `Inventory IDs at a different location than where shipment is coming from:<br><b>${inventoryIds[2]}</b>`;
          } else {
            this.addErrorMessage = errorMessage;
          }
        } else {
          this.addErrorMessage = JSON.stringify(error);
        }

        this.modalService.open(this.addSpecimenError, { size: 'lg' });
        this.form.controls['inventoryIds'].setValue('');
        this.shipmentLoading$.next(false);
      });

    this.shipment$ = this.store$.pipe(
      select(ShipmentStoreSelectors.selectAllShipmentEntities),
      map(shipments => {
        const shipmentEntity = shipments[this.shipment.id];
        if (shipmentEntity) {
          return shipmentEntity instanceof Shipment
            ? shipmentEntity
            : new Shipment().deserialize(shipmentEntity);
        }
        return undefined;
      }),
      tap(shipment => {
        if (shipment !== undefined) {
          this.form.controls['inventoryIds'].setValue('');
          this.shipmentLoading$.next(false);
        }
      }),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.shipment$.pipe(takeUntil(this.unsubscribe$)).subscribe(shipment => {
      if (this.shipment.specimenCount > this.specimenCount) {
        this.toastr.success('Specimen(s) added');
        this.specimenCount = this.shipment.specimenCount;
      }
      this.shipment = shipment;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit() {
    const specimenInventoryIds = this.form.value.inventoryIds
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    this.store$.dispatch(
      ShipmentStoreActions.addSpecimensRequest({
        shipment: this.shipment,
        specimenInventoryIds
      })
    );
    this.shipmentLoading$.next(true);
  }
}
