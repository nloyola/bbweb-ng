import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { catchError, filter, tap, takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '@app/domain/users';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import {
  RootStoreState,
  AuthStoreActions,
  AuthStoreSelectors
} from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  @ViewChild('content') private content;
  private unsubscribe$: Subject<void> = new Subject<void>();
  isLoggingIn$: Observable<any>;
  returnUrl: string;
  loginForm: FormGroup;
  faSpinner = faSpinner;

  constructor(private store$: Store<RootStoreState.State>,
              private route: ActivatedRoute,
              private router: Router,
              private modalService: NgbModal,
              private formBuilder: FormBuilder) { }

  public ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.isLoggingIn$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    this.store$.dispatch(new AuthStoreActions.LoginRequestAction({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }));

    this.store$
      .pipe(
        select(AuthStoreSelectors.selectAuthUser),
        filter(user => user !== null),
        takeUntil(this.unsubscribe$))
      .subscribe((user: User) => {
        this.navigateToReturnUrl();
      });

    this.store$
      .pipe(
        select(AuthStoreSelectors.selectAuthError),
        filter(err => err !== null),
        takeUntil(this.unsubscribe$))
      .subscribe((err: any) => {
        this.store$.dispatch(new AuthStoreActions.LoginClearFailureAction());
        this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' }).result
          .then(() => this.navigateToReturnUrl())
          .catch(() => this.navigateToReturnUrl());
      });
  }

  private navigateToReturnUrl() {
    this.router.navigate([this.returnUrl]);
  }

}
