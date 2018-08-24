import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '@app/domain/users';

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

  private unsubscribe$: Subject<void> = new Subject<void>();

  user: User = null;
  isCollapsed = true;

  constructor(private store$: Store<RootStoreState.State>,
    private router: Router) {
  }

  ngOnInit() {
    this.store$
      .select(AuthStoreSelectors.selectAuthUser)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(user => {
        this.user = user;
      });
  }

  logout() {
    this.store$.dispatch(new AuthStoreActions.LogoutRequestAction());
    this.router.navigate(['/']);
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
