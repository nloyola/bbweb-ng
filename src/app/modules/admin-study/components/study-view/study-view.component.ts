import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Study } from '@app/domain/studies';
import { filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { RootStoreState, EventTypeStoreActions } from '@app/root-store';

interface Tab {
  heading: string;
}

@Component({
  selector: 'app-study-view',
  templateUrl: './study-view.component.html',
  styleUrls: ['./study-view.component.scss']
})
export class StudyViewComponent implements OnInit {

  study: Study;
  tabIds: string[];
  activeTabId: string;

  private tabData: { [id: string]: Tab };

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
    this.activeTabId = this.getActiveTabId(this.router.url);

    this.route.data.subscribe(data => {
      this.study = data.study;
    });

    this.router.events
      .pipe(filter(x => x instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.activeTabId = this.getActiveTabId(event.urlAfterRedirects);
      });

    // clear the selected event type since user is viewing a new study
    this.store$.dispatch(new EventTypeStoreActions.EventTypeSelected({ id: null }));
  }

  public tabSelection($event) {
    this.router.navigate([ '/admin/studies/view', this.study.slug, $event.nextId ]);
  }

  private getActiveTabId(routeUrl: string): string {
    return Object.keys(this.tabData).find(key => routeUrl.includes(key));
  }

}
