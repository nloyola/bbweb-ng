import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Centre } from '@app/domain/centres';
import { RootStoreState, CentreStoreSelectors } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

interface Tab {
  heading: string;
}

@Component({
  selector: 'app-centre-view',
  templateUrl: './centre-view.component.html',
  styleUrls: ['./centre-view.component.scss']
})
export class CentreViewComponent implements OnInit, OnDestroy {

  centre$: Observable<Centre>;
  tabIds: string[];
  activeTabId: string;

  private tabData: { [id: string]: Tab };
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) {
    this.tabData = {
      summary: {
        heading: 'Summary'
      },
      studies: {
        heading: 'Studies'
      },
      locations: {
        heading: 'Locations'
      },
    };
    this.tabIds = Object.keys(this.tabData);
  }

  ngOnInit() {
    this.centre$ = this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentres),
      filter(s => s.length > 0),
      map((centres: Centre[]) => centres.find(s => s.slug === this.route.snapshot.params.slug)),
      filter(centre => centre !== undefined),
      map(centre => {
        // have to do the following because of this issue:
        //
        // https://github.com/ngrx/platform/issues/976
        return (centre instanceof Centre) ? centre :  new Centre().deserialize(centre);
      }),
      takeUntil(this.unsubscribe$));

    this.activeTabId = this.getActiveTabId(this.router.url);

    this.router.events
      .pipe(
        filter(x => x instanceof NavigationEnd),
        takeUntil(this.unsubscribe$))
      .subscribe((event: NavigationEnd) => {
        this.activeTabId = this.getActiveTabId(event.urlAfterRedirects);
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public tabSelection(event: NgbTabChangeEvent) {
    this.router.navigate([ '/admin/centres/view', this.route.snapshot.params.slug, event.nextId ]);
  }

  private getActiveTabId(routeUrl: string): string {
    return Object.keys(this.tabData).find(key => routeUrl.includes(key));
  }

}
