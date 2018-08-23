import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { User } from '@app/domain/users/user.model';

import {
  RootStoreState,
  AuthStoreActions,
  AuthStoreSelectors
} from '@app/root-store';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  user: User = null;
  isCollapsed = true;
  authSubscription: Subscription;

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router) {
  }

  ngOnInit() {
    this.authSubscription = this.store$
      .select(AuthStoreSelectors.selectAuthUser)
      .subscribe(user => {
        this.user = user;
      });
  }

  logout() {
    this.store$.dispatch(new AuthStoreActions.LogoutRequestAction());
    this.router.navigate(['/']);
  }

  public ngOnDestroy() {
    this.authSubscription.unsubscribe();
  }

}
