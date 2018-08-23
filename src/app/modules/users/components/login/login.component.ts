import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { User } from '@app/domain/users/user.model';

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

  @ViewChild('content') private content;
  email: string = '';
  password: string = '';
  returnUrl: string;
  error = '';
  subscriptions: Subscription[] = [];
  isLoggingIn: Observable<boolean>;

  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal) { }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.isLoggingIn = this.store$.select(UserLoginStoreSelectors.selectUserLoginIsLoggingIn);

    this.subscriptions.push(
      this.store$
        .select(UserLoginStoreSelectors.selectUserLoginUser)
        .subscribe((user: User) => {
          if (user !== null) {
            this.navigateToReturnUrl();
          }
        }));

    this.subscriptions.push(
      this.store$
        .select(UserLoginStoreSelectors.selectUserLoginError)
        .subscribe((err: any) => {
          if (err && err.status && (err.status === 401)) {
            this.store$.dispatch(new UserLoginStoreActions.LoginClearFailureAction());
            this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' }).result
              .then(() => {
                this.navigateToReturnUrl();
              }, () => {
                this.navigateToReturnUrl();
              });
          }
        }));
  }

  public ngOnDestroy() {
    if (this.subscriptions && this.subscriptions.length) {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
  }

  private submitForm(values) {
    this.store$.dispatch(new UserLoginStoreActions.LoginRequestAction({
      email: values.email,
      password: values.password
    }));
  }

  private navigateToReturnUrl() {
    this.router.navigate([this.returnUrl]);
  }

}
