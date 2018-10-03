import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Study } from '@app/domain/studies';
import { filter } from 'rxjs/operators';

interface Tab {
  heading: string;
}

@Component({
  selector: 'app-study-view',
  templateUrl: './study-view.component.html',
  styleUrls: ['./study-view.component.scss']
})
export class StudyViewComponent implements OnInit {

  private study: Study;
  private tabData: { [id: string]: Tab };
  private tabIds: string[];
  private activeTabId: string;

  constructor(private router: Router,
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
  }

  private getActiveTabId(routeUrl: string): string {
    return routeUrl.split('/').pop();
  }

  private tabSelection($event) {
    this.router.navigate([ $event.nextId ], { relativeTo: this.route });
  }

}
