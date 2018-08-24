import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { User } from '@app/domain/users/user.model';

import {
  RootStoreState,
  AuthStoreActions,
  AuthStoreSelectors
} from '@app/root-store';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @ViewChild('content') private content;
  private unsubscribe$: Subject<void> = new Subject<void>();
  email: string = '';
  password: string = '';
  returnUrl: string;
  error = '';
  isLoggingIn: Observable<boolean>;

  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal) { }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.isLoggingIn = this.store$.select(AuthStoreSelectors.selectAuthIsLoggingIn);

    this.store$
      .select(AuthStoreSelectors.selectAuthUser)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user: User) => {
        if (user !== null) {
          this.navigateToReturnUrl();
        }
      });

    this.store$
      .select(AuthStoreSelectors.selectAuthError)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((err: any) => {
        if (err && err.status && (err.status === 401)) {
          this.store$.dispatch(new AuthStoreActions.LoginClearFailureAction());
          this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' }).result
            .then(() => {
              this.navigateToReturnUrl();
            }, () => {
              this.navigateToReturnUrl();
            });
        }
      });
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private submitForm(values) {
    this.store$.dispatch(new AuthStoreActions.LoginRequestAction({
      email: values.email,
      password: values.password
    }));
  }

  private navigateToReturnUrl() {
    this.router.navigate([this.returnUrl]);
  }

}
