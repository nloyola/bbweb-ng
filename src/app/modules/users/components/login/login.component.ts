import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import {
  RootStoreState,
  UserLoginStoreActions,
  UserLoginStoreSelectors
} from '@app/root-store';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email: string = '';
  password: string = '';
  returnUrl: string;
  error = '';
  userLoginSubscription: Subscription;

  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  submitForm(values) {
    this.store$.dispatch(new UserLoginStoreActions.LoginRequestAction({
      email: values.email,
      password: values.password
    }));

    this.userLoginSubscription = this.store$
      .select(UserLoginStoreSelectors.selectUserLoginUser)
      .subscribe(user => {
        if (user !== null) {
          this.router.navigate([this.returnUrl]);
        }
      });
  }

  public ngOnDestroy() {
    if (this.userLoginSubscription) {
      this.userLoginSubscription.unsubscribe();
    }
  }

}
