import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '@app/domain/users';

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
export class LoginComponent implements OnInit, OnDestroy {

  @ViewChild('content') private content;
  private unsubscribe$: Subject<void> = new Subject<void>();
  isLoggingIn$: Observable<boolean>;
  returnUrl: string;
  loginForm: FormGroup;

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

    this.isLoggingIn$ = this.store$.pipe(select(AuthStoreSelectors.selectAuthIsLoggingIn));

    this.store$
      .pipe(
        select(AuthStoreSelectors.selectAuthUser),
        takeUntil(this.unsubscribe$))
      .subscribe((user: User) => {
        if (user !== null) {
          this.navigateToReturnUrl();
        }
      });

    this.store$
      .pipe(
        select(AuthStoreSelectors.selectAuthError),
        takeUntil(this.unsubscribe$))
      .subscribe((err: any) => {
        if (err === null) { return; }
        this.store$.dispatch(new AuthStoreActions.LoginClearFailureAction());
        this.modalService.open(this.content, { ariaLabelledBy: 'modal-basic-title' }).result
          .then(() => this.navigateToReturnUrl())
          .catch(() => this.navigateToReturnUrl());
      });
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

  private onSubmit() {
    this.store$.dispatch(new AuthStoreActions.LoginRequestAction({
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    }));
  }

  private navigateToReturnUrl() {
    this.router.navigate([this.returnUrl]);
  }

}
