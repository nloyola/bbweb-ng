import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Centre } from '@app/domain/centres';
import { IdToTab } from '@app/domain';
import { Store, select } from '@ngrx/store';
import { RootStoreState, CentreStoreSelectors } from '@app/root-store';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Study } from '@app/domain/studies';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-centre-shipments-page',
  templateUrl: './centre-shipments-page.component.html',
  styleUrls: ['./centre-shipments-page.component.scss']
})
export class CentreShipmentsPageComponent implements OnInit, OnDestroy {
  centre$: Observable<Centre>;
  tabIds: string[];
  activeTabId: string;

  private tabData: IdToTab;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tabData = {
      incoming: {
        heading: 'Incoming'
      },
      outgoing: {
        heading: 'Outgoing'
      },
      completed: {
        heading: 'Completed'
      }
    };
    this.tabIds = Object.keys(this.tabData);
  }

  ngOnInit() {
    this.centre$ = this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentres),
      filter(s => s.length > 0),
      map((centres: Centre[]) => centres.find(s => s.slug === this.route.snapshot.params.slug)),
      filter(centre => centre !== undefined),
      takeUntil(this.unsubscribe$)
    );

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

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public tabSelection(event: NgbTabChangeEvent) {
    this.router.navigate(['/shipping', this.route.snapshot.params.slug, event.nextId]);
  }

  private getActiveTabId(routeUrl: string): string {
    return Object.keys(this.tabData).find(key => routeUrl.includes(key));
  }
}
