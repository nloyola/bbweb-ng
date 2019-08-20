import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Shipment } from '@app/domain/shipments';
import { ShipmentRemoveModalComponent } from '@app/modules/modals/components/shipment-remove-modal/shipment-remove-modal.component';
import { ModalInputOptions } from '@app/modules/modals/models';
import {
  RootStoreState,
  ShipmentSpecimenStoreActions,
  ShipmentSpecimenStoreSelectors,
  ShipmentStoreActions,
  ShipmentStoreSelectors
} from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, withLatestFrom, tap } from 'rxjs/operators';
import { ShipmentStateTransision } from '../../../../core/services/shipment.service';
import { ModalShipmentHasSpecimensComponent } from '@app/modules/modals/components/modal-shipment-has-specimens/modal-shipment-has-specimens.component';
import { ModalShipmentHasNoSpecimensComponent } from '@app/modules/modals/components/modal-shipment-has-no-specimens/modal-shipment-has-no-specimens.component';
import { Specimen } from '@app/domain/participants';

@Component({
  selector: 'app-shipment-add-items-page',
  templateUrl: './shipment-add-items-page.component.html',
  styleUrls: ['./shipment-add-items-page.component.scss']
})
export class ShipmentAddItemsPageComponent implements OnInit, OnDestroy {
  @ViewChild('packedTimeModal', { static: false }) packedTimeModal: TemplateRef<any>;
  @ViewChild('sentTimeModal', { static: false }) sentTimeModal: TemplateRef<any>;

  shipment: Shipment;
  packedTimeModalOptions: ModalInputOptions = { required: true };
  sentTimeModalOptions: ModalInputOptions = { required: true };

  private shipment$: Observable<Shipment>;
  private shipmentToRemove$ = new Subject<Shipment>();
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();
  private packedTime$ = new Subject<Date>();
  private sentTime$ = new Subject<Date>();
  private shipmentToTagAsPacked$ = new Subject<Shipment>();
  private shipmentToTagAsSent$ = new Subject<Shipment>();
  private specimens$: Observable<Specimen>;

  maxPages$: Observable<number>;
  totalSpecimens$: Observable<number>;

  sortField: string;
  currentPage: number;

  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.shipment = this.route.snapshot.data.shipment;

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
      this.shipment = shipment;
    });

    this.setupRemove();
    this.setupTagAsPacked();
    this.setupTagAsSent();
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  sortBy(sortField: string) {
    this.sortField = sortField;
    this.updateSpecimens();
  }

  paginationPageChange(page: number) {
    this.currentPage = page;
    this.updateSpecimens();
  }

  updateSpecimens(): void {
    const searchParams = {
      sort: this.sortField,
      page: this.currentPage
    };
    this.store$.dispatch(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({ shipment: this.shipment, searchParams })
    );
  }

  remove() {
    this.shipmentToRemove$.next(this.shipment);
    this.queryForSpecimens();
  }

  tagAsPacked() {
    this.shipmentToTagAsPacked$.next(this.shipment);
    this.queryForSpecimens();
  }

  tagAsSent() {
    this.shipmentToTagAsSent$.next(this.shipment);
    this.queryForSpecimens();
  }

  private setupTagAsPacked(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.packedTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([shipment, _message]) => {
        this.toastr.success('Packed time recorded');
        this.router.navigate(['/shipping/view', shipment.id]);
      });

    this.store$
      .pipe(
        select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenSearchRepliesAndEntities),
        filter(specimens => specimens !== undefined),
        withLatestFrom(this.shipmentToTagAsPacked$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([pagedReply, shipment]) => {
        if (pagedReply.entities.length <= 0) {
          this.modalService.open(ModalShipmentHasNoSpecimensComponent, { size: 'lg' });
          return;
        }

        this.modalService
          .open(this.packedTimeModal, { size: 'lg' })
          .result.then((datetime: Date) => {
            this.store$.dispatch(
              ShipmentStoreActions.updateShipmentRequest({
                shipment,
                attributeName: 'state',
                value: {
                  transition: ShipmentStateTransision.Packed,
                  datetime
                }
              })
            );
            this.packedTime$.next(datetime);
          })
          .catch(() => undefined);
      });
  }

  private setupTagAsSent(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.sentTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([shipment, message]) => {
        this.toastr.success('Packed time and sent time recorded');
        this.router.navigate(['/shipping/view', shipment.id]);
      });

    this.store$
      .pipe(
        select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenSearchRepliesAndEntities),
        filter(specimens => specimens !== undefined),
        withLatestFrom(this.shipmentToTagAsSent$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([pagedReply, shipment]) => {
        if (pagedReply.entities.length <= 0) {
          this.modalService.open(ModalShipmentHasNoSpecimensComponent, { size: 'lg' });
          return;
        }

        this.modalService
          .open(this.sentTimeModal, { size: 'lg' })
          .result.then(([packedTime, sentTime]) => {
            this.store$.dispatch(
              ShipmentStoreActions.updateShipmentRequest({
                shipment: this.shipment,
                attributeName: 'state',
                value: {
                  transition: ShipmentStateTransision.SkipToSent,
                  datetime: packedTime,
                  skipDatetime: sentTime
                }
              })
            );
            this.sentTime$.next(sentTime);
          })
          .catch(() => undefined);
      });
  }

  private setupRemove(): void {
    this.store$
      .pipe(
        select(ShipmentStoreSelectors.selectShipmentLastRemovedId),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('The shipment was removed');
        this.router.navigate(['/shipping']);
      });

    this.store$
      .pipe(
        select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenSearchRepliesAndEntities),
        filter(specimens => specimens !== undefined),
        withLatestFrom(this.shipmentToRemove$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([pagedReply, shipment]) => {
        if (pagedReply.entities.length > 0) {
          this.modalService.open(ModalShipmentHasSpecimensComponent);
          return;
        }

        this.modalService
          .open(ShipmentRemoveModalComponent)
          .result.then(() => {
            this.store$.dispatch(
              ShipmentStoreActions.removeShipmentRequest({
                shipment
              })
            );
            this.updatedMessage$.next('Shipment removed');
          })
          .catch(() => undefined);
      });
  }

  private queryForSpecimens() {
    this.store$.dispatch(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment: this.shipment,
        searchParams: {}
      })
    );
  }
}
