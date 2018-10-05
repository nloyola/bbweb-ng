import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
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
export class HeaderComponent implements OnInit {

  user$: Observable<User>;
  isCollapsed = true;

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router) {}

  ngOnInit() {
    this.user$ = this.store$.pipe(select(AuthStoreSelectors.selectAuthUser));
  }

  logout() {
    this.store$.dispatch(new AuthStoreActions.LogoutRequestAction());
    this.router.navigate(['/']);
  }

}
