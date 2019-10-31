import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasswordValidation } from '@app/core/password-validation';
import { AuthStoreActions, AuthStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  isRegistering$ = new Subject<boolean>();
  registerForm: FormGroup;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]]
      },
      { validator: PasswordValidation.matchingPasswords() }
    );

    this.store$
      .pipe(
        select(AuthStoreSelectors.selectAuthRegisteredUser),
        withLatestFrom(this.isRegistering$),
        filter(user => user !== null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.toastr.success(
          'Your account was created and is now pending administrator approval.',
          'Registration Successful',
          { disableTimeOut: true }
        );
        this.isRegistering$.next(false);
        this.navigateToReturnUrl();
      });

    this.store$
      .pipe(
        select(AuthStoreSelectors.selectAuthError),
        withLatestFrom(this.isRegistering$),
        filter(err => err !== null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([err, isRegistering]) => {
        this.isRegistering$.next(false);
        this.store$.dispatch(AuthStoreActions.registerClearFailureAction());

        let message: string;
        if (err && err.status) {
          if (err.status === 403 && err.error.message === 'email already registered') {
            message = 'That email address is already registered.';
          } else if (err.error) {
            message = err.error.message;
          } else {
            message = 'Registration failed.';
          }
          this.toastr.error(message, 'Registration Error', { disableTimeOut: true });
        }
      });
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  onSubmit() {
    this.store$.dispatch(
      AuthStoreActions.registerRequestAction({
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      })
    );
    this.isRegistering$.next(true);
  }

  onCancel() {
    this.navigateToReturnUrl();
  }

  private navigateToReturnUrl() {
    this.router.navigate(['/']);
  }
}
