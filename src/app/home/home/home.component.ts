import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { SharedModule } from '@app/shared/shared.module';
import { Crumb } from '@app/domain/crumb/crumb.model';
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

  user$: Observable<User>;
  error$: Observable<any>;
  isLoading$: Observable<boolean>;
  userLoginSubscription: Subscription;

  isUserAuthenticated: boolean;
  hasRoles: boolean;

  constructor(private store$: Store<RootStoreState.State>) {
  }

  ngOnInit() {
    this.userLoginSubscription = this.store$
      .select(UserLoginStoreSelectors.selectUserLoginUser)
      .subscribe(user => {
        if (user !== null) {
          this.isUserAuthenticated = true;
          this.hasRoles = user.roles.length > 0;
        } else {
          this.isUserAuthenticated = false;
          this.hasRoles = false;
        }
      });
  }

  public ngOnDestroy() {
    this.userLoginSubscription.unsubscribe();
  }

}
