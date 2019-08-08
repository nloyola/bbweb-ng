import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Tab, IdToTab } from '@app/domain';
import { Study } from '@app/domain/studies';
import { RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Shipment } from '@app/domain/shipments';
import { StepperSelectionEvent } from '@angular/cdk/stepper';

@Component({
  selector: 'app-shipment-view-page',
  templateUrl: './shipment-view-page.component.html',
  styleUrls: ['./shipment-view-page.component.scss']
})
export class ShipmentViewPageComponent implements OnInit, OnDestroy {
  shipment: Shipment;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.shipment = this.route.snapshot.data.shipment;

    this.router.events
      .pipe(
        filter(x => x instanceof NavigationEnd),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((event: NavigationEnd) => {});
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  stepClick(event: StepperSelectionEvent) {
    if (event.selectedIndex < 3) {
      return;
    } else {
    }
  }
}
