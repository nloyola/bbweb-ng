import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Shipment } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreSelectors } from '@app/root-store';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-shipment-add-specimens-card',
  templateUrl: './shipment-add-specimens-card.component.html',
  styleUrls: ['./shipment-add-specimens-card.component.scss']
})
export class ShipmentAddSpecimensCardComponent implements OnInit, OnDestroy {
  @Input() shipment: Shipment;

  // the inventory IDs entered by the user
  @Output() onAction = new EventEmitter<string[]>();

  faVial = faVial;
  shipmentLoading = false;
  shipment$: Observable<Shipment>;
  form: FormGroup;
  inputInventoryIds = [];
  existingInventoryIds = [];

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      inventoryIds: ['', [Validators.required]]
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
          this.initializeForm();
          this.shipmentLoading = false;
        }
      }),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.shipment$
      .pipe(
        filter(shipment => shipment !== undefined),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(shipment => {
        this.shipment = shipment;
      });

    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentError),
        filter(error => !!error),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.shipmentLoading = false;
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
    this.onAction.emit(specimenInventoryIds);
    this.shipmentLoading = true;
  }

  private initializeForm(): void {
    this.form.controls['inventoryIds'].setValue('');
    this.form.markAsUntouched();
  }
}
