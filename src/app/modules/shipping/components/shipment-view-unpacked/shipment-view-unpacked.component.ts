import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ShipmentStateTransision } from '@app/core/services';
import { BlockingProgressService } from '@app/core/services/blocking-progress.service';
import { IdToTab } from '@app/domain';
import { RootStoreState, ShipmentStoreActions } from '@app/root-store';
import { NgbModal, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { filter, takeUntil } from 'rxjs/operators';
import { ShipmentViewer } from '../shipment-viewer';

@Component({
  selector: 'app-shipment-view-unpacked',
  templateUrl: './shipment-view-unpacked.component.html',
  styleUrls: ['./shipment-view-unpacked.component.scss']
})
export class ShipmentViewUnpackedComponent extends ShipmentViewer {
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

  constructor(
    store$: Store<RootStoreState.State>,
    route: ActivatedRoute,
    modalService: NgbModal,
    toastr: ToastrService,
    blockingProgressService: BlockingProgressService,
    private router: Router
  ) {
    super(store$, route, toastr, modalService, blockingProgressService);
    this.tabIds = Object.keys(this.tabData);
  }

  ngOnInit() {
    super.ngOnInit();

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
        this.notificationMessage = 'Shipment back in Receivedstate';
        this.blockingProgressService.show('Updating Shipment...');
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
        this.notificationMessage = 'Completed time recorded';
        this.blockingProgressService.show('Updating Shipment...');
      })
      .catch(() => undefined);
  }

  private getActiveTabId(routeUrl: string): string {
    return Object.keys(this.tabData).find(key => routeUrl.includes(key));
  }
}
