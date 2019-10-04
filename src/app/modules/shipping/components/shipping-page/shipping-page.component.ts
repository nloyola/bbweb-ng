import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStoreSelectors, CentreStoreActions, RootStoreState } from '@app/root-store';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Centre } from '../../../../domain/centres/centre.model';

@Component({
  selector: 'app-shipping-page',
  templateUrl: './shipping-page.component.html',
  styleUrls: ['./shipping-page.component.scss']
})
export class ShippingPageComponent implements OnInit, OnDestroy {
  validUser$: Observable<boolean>;
  menuItems: DropdownMenuItem[];

  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const searchParams = {
      filter: 'state::enabled',
      page: 1,
      limit: 5
    };

    this.menuItems = [
      {
        kind: 'selectable',
        label: 'Add Shipment',
        icon: 'add_circle',
        iconClass: 'success-icon',
        onSelected: () => {
          this.router.navigate(['/shipping/add']);
        }
      }
    ];

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
}
