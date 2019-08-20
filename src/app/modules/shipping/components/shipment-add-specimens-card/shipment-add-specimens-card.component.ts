import { Component, Input, OnDestroy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Shipment } from '@app/domain/shipments';
import { RootStoreState, ShipmentStoreActions, ShipmentStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { filter, takeUntil, map, shareReplay } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalInputOptions } from '@app/modules/modals/models';
import { ModalSpecimensExistInAnotherShipmentComponent } from '../modal-specimens-exist-in-another-shipment/modal-specimens-exist-in-another-shipment.component';

@Component({
  selector: 'app-shipment-add-specimens-card',
  templateUrl: './shipment-add-specimens-card.component.html',
  styleUrls: ['./shipment-add-specimens-card.component.scss']
})
export class ShipmentAddSpecimensCardComponent implements OnInit, OnDestroy {
  // @ViewChild('specimensExistModal', { static: false }) specimensExistModal: TemplateRef<any>;
  @Input() shipment: Shipment;

  // specimensExistModalOptions: ModalInputOptions = { required: true };

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
          console.log(error.error.error.message);
          const errorMsg = error.error.error.message;
          if (errorMsg.match(/specimens are already in an active shipment/)) {
            const splitted = errorMsg.split(':')[2];
            if (splitted !== undefined) {
              this.existingInventoryIds = splitted.split(',');
              const modalRef = this.modalService.open(ModalSpecimensExistInAnotherShipmentComponent);
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
