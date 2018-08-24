import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private service: BreadcrumbService) { }


  ngOnInit() {
    const s = this.service.crumbs$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(x => {
        this.crumbs = x;
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
