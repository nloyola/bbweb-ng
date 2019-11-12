import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StateFilter } from '@app/domain/search-filters';
import { Shipment, ShipmentItemState, ShipmentSpecimen } from '@app/domain/shipments';
import {
  RootStoreState,
  ShipmentSpecimenStoreActions,
  ShipmentStoreActions,
  ShipmentSpecimenStoreSelectors
} from '@app/root-store';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store, select } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { filter, withLatestFrom, takeUntil } from 'rxjs/operators';
import { ShipmentSpecimenAction } from '../shipment-specimens-table/shipment-specimens-table.container';
import { UnpackedShipmentSpeciemensComponent } from '../unpacked-shipment-specimens/unpacked-shipment-specimens.component';

@Component({
  selector: 'app-unpacked-shipment-extra',
  templateUrl: './unpacked-shipment-extra.component.html',
  styleUrls: ['./unpacked-shipment-extra.component.scss']
})
export class UnpackedShipmentExtraComponent extends UnpackedShipmentSpeciemensComponent {
  @ViewChild('extraSpecimenError', { static: false }) extraSpecimenError: TemplateRef<any>;
  @ViewChild('removeShipmentSpecimenModal', { static: false }) removeShipmentSpecimenModal: TemplateRef<any>;

  faVial = faVial;
  shipment: Shipment;
  form: FormGroup;
  specimenFilter = new StateFilter(Object.values(ShipmentItemState), ShipmentItemState.Extra, false);
  extraErrorMessage: string;
  shipmentSpecimenToRemove: ShipmentSpecimen;
  actions: ShipmentSpecimenAction[] = [
    {
      id: 'remove',
      label: 'Remove from Shipment',
      icon: 'remove_circle',
      iconClass: 'danger-icon'
    }
  ];
  toastrMessage: string = undefined;

  constructor(
    store$: Store<RootStoreState.State>,
    route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    super(store$, route);
  }

  ngOnInit() {
    this.shipment = this.route.parent.snapshot.data.shipment;
    super.ngOnInit();

    this.shipment$
      .pipe(filter(shipment => shipment !== undefined && this.toastrMessage !== undefined))
      .subscribe(() => {
        debugger;
        this.toastr.success(this.toastrMessage);
        this.toastrMessage = undefined;
      });

    this.store$
      .pipe(
        select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenLastRemovedId),
        filter(shipmentSpecimenId => shipmentSpecimenId !== undefined && this.toastrMessage !== undefined),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success(this.toastrMessage);
        this.toastrMessage = undefined;
      });

    this.error$.pipe(filter(() => this.toastrMessage !== undefined)).subscribe(errorMessage => {
      this.extraErrorMessage = errorMessage;
      this.modalService.open(this.extraSpecimenError, { size: 'lg' });
    });
  }

  tagShipmentSpecimens(specimenInventoryIds: string[]): void {
    this.store$.dispatch(
      ShipmentStoreActions.tagSpecimensRequest({
        shipment: this.shipment,
        specimenInventoryIds,
        specimenTag: ShipmentItemState.Extra
      })
    );
    this.markTagPending();
    this.shipmentLoading$.next(true);
    this.toastrMessage = 'Specimen(s) tagged as Extra';
  }

  shipmentSpecimenAction([shipmentSpecimen, actionId]) {
    switch (actionId) {
      case 'remove':
        this.removeShipmentSpecimen(shipmentSpecimen);
        break;
      default:
        throw new Error(`action ${actionId} is not handled`);
    }
  }

  private removeShipmentSpecimen(shipmentSpecimen: ShipmentSpecimen) {
    this.shipmentSpecimenToRemove = shipmentSpecimen;
    const modal = this.modalService.open(this.removeShipmentSpecimenModal, { size: 'lg' });
    modal.result
      .then(() => {
        this.store$.dispatch(
          ShipmentSpecimenStoreActions.removeShipmentSpecimenRequest({ shipmentSpecimen })
        );
        this.toastrMessage = 'Specimen removed';
        this.markTagPending();
        //debugger;
      })
      .catch(() => undefined);
  }
}
