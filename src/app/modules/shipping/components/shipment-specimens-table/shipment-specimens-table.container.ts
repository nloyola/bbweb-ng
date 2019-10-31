import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  TemplateRef
} from '@angular/core';
import { PagedReplyInfo } from '@app/domain';
import { Shipment, ShipmentSpecimen } from '@app/domain/shipments';
import {
  RootStoreState,
  ShipmentSpecimenStoreActions,
  ShipmentSpecimenStoreSelectors,
  ShipmentStoreSelectors
} from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SpecimenViewModalComponent } from '@app/modules/modals/components/specimen-view-modal/specimen-view-modal.component';
import { ToastrService } from 'ngx-toastr';

interface ShipmentSpecimenData {
  pageInfo$: Observable<PagedReplyInfo<ShipmentSpecimen>>;
  maxPages$: Observable<number>;
  totalSpecimens$: Observable<number>;
  specimens$: Observable<ShipmentSpecimen[]>;
  sortField: string;
  currentPage: number;
}

@Component({
  selector: 'app-shipment-specimens-table',
  template: `
    <app-shipment-specimens-table-ui
      [specimensThisPage]="shipmentSpecimenData.specimens$ | async"
      [maxPages]="shipmentSpecimenData.maxPages$ | async"
      [totalSpecimens]="shipmentSpecimenData.totalSpecimens$ | async"
      [loading]="isLoading$ | async"
      [readOnly]="readOnly"
      (sortBy)="specimensTableSortBy($event)"
      (pageChanged)="specimensTablePageChanged($event)"
      (onView)="viewShipmentSpecimen($event)"
      (onRemove)="removeShipmentSpecimen($event)"
    ></app-shipment-specimens-table-ui>

    <ng-template #removeShipmentSpecimenModal let-modal>
      <app-modal (confirm)="modal.close()" (dismiss)="modal.dismiss()">
        <div class="title" i18n>
          Remove Specimen from this Shipment
        </div>
        <div class="body" i18n>
          Are you sure you want to remove the Specimen with Inventory ID
          <b>{{ shipmentSpecimenToRemove.specimen.inventoryId }}</b> from the shipment?
        </div>
      </app-modal>
    </ng-template>
  `,
  styleUrls: ['./shipment-specimens-table.component.scss']
})
export class ShipmentSpecimensTableContainerComponent implements OnInit, OnDestroy {
  @ViewChild('removeShipmentSpecimenModal', { static: false }) removeShipmentSpecimenModal: TemplateRef<any>;

  @Input() shipment: Shipment;
  @Input() readOnly = true;

  shipmentSpecimenData: ShipmentSpecimenData;
  shipmentSpecimenToRemove: ShipmentSpecimen;
  isLoading$ = new BehaviorSubject<boolean>(true);

  private updatedMessage$ = new Subject<string>();
  protected unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.shipmentSpecimenData = this.createShipmentSpecimenData();
  }

  ngOnInit() {
    this.store$
      .pipe(
        select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenSearchActive),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(active => {
        this.isLoading$.next(active);
      });

    // this selector updates the shipment specimens table when the shipment is modified
    this.store$
      .pipe(
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
        filter(shipment => shipment !== undefined),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.updateSpecimens();
      });

    this.initOnShipmentSpecimenRemoved();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  specimensTableSortBy(sortField: string): void {
    this.shipmentSpecimenData.sortField = sortField;
    this.updateSpecimens();
  }

  specimensTablePageChanged(page: number): void {
    this.shipmentSpecimenData.currentPage = page;
    this.updateSpecimens();
  }

  viewShipmentSpecimen(shipmentSpecimen: ShipmentSpecimen) {
    const modalRef = this.modalService.open(SpecimenViewModalComponent, { size: 'lg' });
    modalRef.componentInstance.specimen = shipmentSpecimen.specimen;
  }

  removeShipmentSpecimen(shipmentSpecimen: ShipmentSpecimen) {
    this.shipmentSpecimenToRemove = shipmentSpecimen;
    const modal = this.modalService.open(this.removeShipmentSpecimenModal, { size: 'lg' });
    modal.result
      .then(() => {
        this.store$.dispatch(
          ShipmentSpecimenStoreActions.removeShipmentSpecimenRequest({ shipmentSpecimen })
        );
        this.updatedMessage$.next('Specimen Removed');
        this.isLoading$.next(true);
      })
      .catch(() => undefined);
  }

  // reload the table if any shipment specimen is removed
  private initOnShipmentSpecimenRemoved(): void {
    this.store$
      .pipe(
        select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenLastRemovedId),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([id, message]) => {
        if (id === this.shipmentSpecimenToRemove.id) {
          this.toastr.success(message);
          this.updateSpecimens();
        }
      });
  }

  private createShipmentSpecimenData(): ShipmentSpecimenData {
    const pageInfo$ = this.store$.pipe(
      select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenSearchRepliesAndEntities),
      filter(info => info !== undefined),
      shareReplay()
    );

    const specimens$ = pageInfo$.pipe(map(info => info.entities.filter(e => e !== undefined)));
    const maxPages$ = pageInfo$.pipe(map(info => info.maxPages));
    const totalSpecimens$ = pageInfo$.pipe(map(info => info.total));

    return {
      pageInfo$,
      specimens$,
      maxPages$,
      totalSpecimens$,
      sortField: 'inventoryId',
      currentPage: 1
    };
  }

  private updateSpecimens(): void {
    this.store$.dispatch(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment: this.shipment,
        searchParams: {
          sort: this.shipmentSpecimenData.sortField,
          page: this.shipmentSpecimenData.currentPage
        }
      })
    );
  }
}
