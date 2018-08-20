import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Crumb } from '@app/domain/crumb';
import { BreadcrumbService } from '@app/core/services/breadcrumb.service';

// borrowed from:
//
// https://github.com/McNull/ngx-breadcrumbs/blob/master/src/lib/mc-breadcrumbs/src/service/mc-breadcrumbs.service.ts

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {

  private crumbs: Crumb[];
  private subscriptions = new Array<Subscription>();

  constructor(private service: BreadcrumbService) { }


  ngOnInit() {
    const s = this.service.crumbs$.subscribe(x => {
      console.log(x);
      this.crumbs = x;
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}
