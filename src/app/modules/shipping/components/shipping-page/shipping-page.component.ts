import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  AuthStoreSelectors,
  RootStoreState,
  CentreStoreActions,
  CentreStoreSelectors
} from '@app/root-store';
import { Store, select } from '@ngrx/store';
import { map, filter, takeUntil, tap } from 'rxjs/operators';
import { SearchParams } from '@app/domain';
import { PagedReply } from '../../../../domain/paged-reply.model';
import { Centre } from '../../../../domain/centres/centre.model';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shipping-page',
  templateUrl: './shipping-page.component.html',
  styleUrls: ['./shipping-page.component.scss']
})
export class ShippingPageComponent implements OnInit, OnDestroy {
  validUser$: Observable<boolean>;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const searchParams = new SearchParams('state::enabled', null, 1, 5);
    this.store$.dispatch(CentreStoreActions.searchCentresRequest({ searchParams }));

    this.validUser$ = this.store$.pipe(
      select(AuthStoreSelectors.selectAuthUser),
      map(user => user.hasShippingUserRole())
    );
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  centreSelected(centre: Centre) {
    this.router.navigate([centre.slug], { relativeTo: this.route });
  }

  add() {
    this.router.navigate(['/shipping/add']);
  }
}
