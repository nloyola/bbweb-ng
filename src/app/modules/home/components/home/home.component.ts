import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@app/domain/users';
import { AuthStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {

  user: User;
  isUserAuthenticated: boolean;
  hasRoles: boolean;
  shippingAllowed: boolean;
  adminAllowed: boolean;
  allowCollection: boolean;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>) {
  }

  ngOnInit() {
    this.store$
      .pipe(
        select(AuthStoreSelectors.selectAuthUser),
        takeUntil(this.unsubscribe$))
      .subscribe((user: User) => {
        this.user = user;
        if (user) {
          this.isUserAuthenticated = true;
          this.hasRoles = this.user.hasRoles();
          this.allowCollection = this.user.hasSpecimenCollectorRole();
          this.shippingAllowed = this.user.hasShippingUserRole();
          this.adminAllowed = this.user.hasAdminRole();
        } else {
          this.isUserAuthenticated = false;
          this.hasRoles = false;
          this.allowCollection = false;
          this.shippingAllowed = false;
          this.adminAllowed = false;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
