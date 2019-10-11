import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Shipment } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { ModalSpecimensInOtherShipmentComponent } from '../modal-specimens-in-other-shipment/modal-specimens-in-other-shipment.component';

@Component({
  selector: 'app-shipment-add-specimens-card',
  templateUrl: './shipment-add-specimens-card.component.html',
  styleUrls: ['./shipment-add-specimens-card.component.scss']
})
export class ShipmentAddSpecimensCardComponent implements OnInit, OnDestroy {
  // @ViewChild('specimensExistModal', { static: false }) specimensExistModal: TemplateRef<any>;
  @Input() shipment: Shipment;

  // specimensExistModalOptions: ModalInputOptions = { required: true };

  isLoading$: Observable<boolean>;
  shipmentLoading$: Observable<boolean>;
  shipment$: Observable<Shipment>;
  specimenCount: number;
  form: FormGroup;
  inputInventoryIds = [];

  existingInventoryIds = [];

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
        if (error.actionType === ShipmentStoreActions.addSpecimensFailure.type) {
          const errorMsg = error.error.error.message;
          if (errorMsg.match(/specimens are already in an active shipment/)) {
            const splitted = errorMsg.split(':')[2];
            if (splitted !== undefined) {
              this.existingInventoryIds = splitted.split(',');
              const modalRef = this.modalService.open(ModalSpecimensInOtherShipmentComponent);
              modalRef.componentInstance.specimenIds = this.existingInventoryIds;
            }
          } else {
            // FIXME: what do we do here?
            //
            // also handle:
            // - invalid inventory id
            // - inventory id for specimen at a different centre
          }
        }
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
    this.form.controls['inventoryIds'].setValue('');
  }
}
