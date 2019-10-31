import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ShipmentStateTransision } from '@app/core/services';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { NgbModal, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil, withLatestFrom, filter } from 'rxjs/operators';
import { ShipmentViewerComponent } from '../shipment-viewer/shipment-viewer.component';
import { IdToTab } from '@app/domain';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-shipment-view-unpacked',
  templateUrl: './shipment-view-unpacked.component.html',
  styleUrls: ['./shipment-view-unpacked.component.scss']
})
export class ShipmentViewUnpackedComponent extends ShipmentViewerComponent {
  @ViewChild('completedTimeModal', { static: false }) completedTimeModal: TemplateRef<any>;
  @ViewChild('containsSpecimensModal', { static: false }) containsSpecimensModal: TemplateRef<any>;
  @ViewChild('backToReceivedModal', { static: false }) backToReceivedModal: TemplateRef<any>;
  @ViewChild('containsUnpackedSpecimensModal', { static: false }) containsUnpackedSpecimensModal: TemplateRef<
    any
  >;

  tabIds: string[];
  activeTabId: string;

  private tabData: IdToTab = {
    information: { heading: 'Information' },
    'unpacked-specimens': { heading: 'Unpacked Specimens' },
    'received-specimens': { heading: 'Received Specimens' },
    'missing-specimens': { heading: 'Missing Specimens' },
    'extra-specimens': { heading: 'Extra Specimens' }
  };

  private backToReceived$ = new Subject<boolean>();
  private completedTime$ = new Subject<Date>();

  constructor(
    store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    super(store$);
    this.tabIds = Object.keys(this.tabData);
  }

  ngOnInit() {
    super.ngOnInit();
    this.initBackToReceived();
    this.initTagAsCompleted();

    this.activeTabId = this.getActiveTabId(this.router.url);

    this.router.events
      .pipe(
        filter(x => x instanceof NavigationEnd),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((event: NavigationEnd) => {
        this.activeTabId = this.getActiveTabId(event.urlAfterRedirects);
      });
  }

  backToReceived() {
    if (this.shipment.specimenCount !== this.shipment.presentSpecimenCount) {
      this.modalService.open(this.containsUnpackedSpecimensModal, { size: 'lg' });
      return;
    }

    this.modalService
      .open(this.backToReceivedModal)
      .result.then(() => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.Received,
              datetime: this.shipment.timeReceived
            }
          })
        );
        this.backToReceived$.next(true);
      })
      .catch(() => undefined);
  }

  tabSelection(event: NgbTabChangeEvent) {
    this.router.navigate([event.nextId], { relativeTo: this.route });
  }

  tagAsCompleted() {
    if (this.shipment.presentSpecimenCount > 0) {
      this.modalService.open(this.containsSpecimensModal, { size: 'lg' });
      return;
    }

    this.modalService
      .open(this.completedTimeModal, { size: 'lg' })
      .result.then((datetime: Date) => {
        this.store$.dispatch(
          ShipmentStoreActions.updateShipmentRequest({
            shipment: this.shipment,
            attributeName: 'state',
            value: {
              transition: ShipmentStateTransision.Completed,
              datetime
            }
          })
        );
        this.completedTime$.next(datetime);
      })
      .catch(() => undefined);
  }

  private initBackToReceived(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.backToReceived$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('Shipment back in Receivedstate');
      });
  }

  private initTagAsCompleted(): void {
    this.shipment$
      .pipe(
        withLatestFrom(this.completedTime$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success('Completed time recorded');
      });
  }

  private getActiveTabId(routeUrl: string): string {
    return Object.keys(this.tabData).find(key => routeUrl.includes(key));
  }
}
