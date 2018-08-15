import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { AuthService } from '@app/users';
import { Subscription } from 'rxjs';
import { User } from '@app/domain/users/user.model';

import {
  RootStoreState,
  UserLoginStoreActions,
  UserLoginStoreSelectors
} from '@app/root-store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  user: User = null;
  isCollapsed = true;
  userLoginSubscription: Subscription;

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router) {
  }

  ngOnInit() {
    this.userLoginSubscription = this.store$
      .select(UserLoginStoreSelectors.selectUserLoginUser)
      .subscribe(user => {
        this.user = user;

        if (user === null) {
          this.router.navigate(['/']);
        }
      });
  }

  logout() {
    this.store$.dispatch(new UserLoginStoreActions.LogoutRequestAction());
  }

  public ngOnDestroy() {
    this.userLoginSubscription.unsubscribe();
  }

}
