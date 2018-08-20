import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { SharedModule } from '@app/shared/shared.module';
import { User } from '@app/domain/users/user.model';

import {
  RootStoreState,
  UserLoginStoreActions,
  UserLoginStoreSelectors
} from '@app/root-store';

@Component({
  selector: 'home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {

  userLoginSubscription: Subscription;

  private user: User;
  private isUserAuthenticated: boolean;
  private hasRoles: boolean;
  private allowCollection: boolean;
  private shippingAllowed: boolean;
  private adminAllowed: boolean;

  constructor(private store$: Store<RootStoreState.State>) {
  }

  ngOnInit() {
    this.userLoginSubscription = this.store$
      .select(UserLoginStoreSelectors.selectUserLoginUser)
      .subscribe((user: User) => {
        this.user = user;
        if (user !== null) {
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

  public ngOnDestroy() {
    this.userLoginSubscription.unsubscribe();
  }

}
