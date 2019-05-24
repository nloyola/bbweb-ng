import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Tab, IdToTab } from '@app/domain';
import { Study } from '@app/domain/studies';
import { RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-study-view',
  templateUrl: './study-view.component.html',
  styleUrls: ['./study-view.component.scss']
})
export class StudyViewComponent implements OnInit, OnDestroy {

  study$: Observable<Study>;
  tabIds: string[];
  activeTabId: string;

  private tabData: IdToTab;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) {
    this.tabData = {
      summary: {
        heading: 'Summary'
      },
      participants: {
        heading: 'Participants'
      },
      collection: {
        heading: 'Collection'
      },
      processing: {
        heading: 'Processing'
      },
    };
    this.tabIds = Object.keys(this.tabData);
  }

  ngOnInit() {
    this.study$ = this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudies),
      filter(s => s.length > 0),
      map((studies: Study[]) => studies.find(s => s.slug === this.route.snapshot.params.slug)),
      filter(study => study !== undefined),
      takeUntil(this.unsubscribe$));

    this.activeTabId = this.getActiveTabId(this.router.url);

    this.router.events.pipe(
      filter(x => x instanceof NavigationEnd),
      takeUntil(this.unsubscribe$)
    ).subscribe((event: NavigationEnd) => {
      this.activeTabId = this.getActiveTabId(event.urlAfterRedirects);
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public tabSelection(event: NgbTabChangeEvent) {
    this.router.navigate([ '/admin/studies', this.route.snapshot.params.slug, event.nextId ]);
  }

  private getActiveTabId(routeUrl: string): string {
    return Object.keys(this.tabData).find(key => routeUrl.includes(key));
  }

}
