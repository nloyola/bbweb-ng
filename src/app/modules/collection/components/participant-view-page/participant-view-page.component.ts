import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IdToTab } from '@app/domain';
import { Participant } from '@app/domain/participants';
import { ParticipantStoreSelectors, RootStoreState } from '@app/root-store';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-participant-view-page',
  templateUrl: './participant-view-page.component.html',
  styleUrls: ['./participant-view-page.component.scss']
})
export class ParticipantViewPageComponent implements OnInit, OnDestroy {

  participant$: Observable<Participant>;
  tabIds: string[];
  activeTabId: string;

  private tabData: IdToTab;
  private participantSlug: string;
  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute) {
    this.tabData = {
      summary: {
        heading: 'Summary'
      },
      collection: {
        heading: 'Collection'
      }
    };
    this.tabIds = Object.keys(this.tabData);
  }

  ngOnInit() {
    this.participantSlug = this.route.snapshot.params.slug;
    this.participant$ = this.store$.pipe(
      select(ParticipantStoreSelectors.selectAllParticipants),
      map(participants => participants.find(p => p.slug === this.route.snapshot.params.slug)),
      takeUntil(this.unsubscribe$),
      shareReplay());

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
    this.router.navigate([ '/collection', this.participantSlug, event.nextId ]);
  }

  private getActiveTabId(routeUrl: string): string {
    return Object.keys(this.tabData).find(key => routeUrl.includes(key));
  }

}
