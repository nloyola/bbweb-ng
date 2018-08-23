import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasswordValidation } from '@app/core/password-validation';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { User } from '@app/domain/users/user.model';

import {
  RootStoreState,
  AuthStoreActions,
  AuthStoreSelectors
} from '@app/root-store';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  subscriptions: Subscription[] = [];

  constructor(
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.registerForm = this.formBuilder.group(
      {
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validator: PasswordValidation.matchingPasswords
      });

    this.subscriptions.push(
      this.store$
        .select(AuthStoreSelectors.selectAuthRegisteredUser)
        .subscribe((user: User) => {
          if (user !== null) {
            this.toastr.success('Your account was created and is now pending administrator approval.',
              'Registration Successful',
              {
                disableTimeOut: true
              });
            this.navigateToReturnUrl();
          }
        }));

    this.subscriptions.push(
      this.store$
        .select(AuthStoreSelectors.selectAuthError)
        .subscribe((err: any) => {
          if (err === null) return;

          console.log(err);
          let message;
          if (err && err.status) {
            if ((err.status === 403) && (err.error.message === 'email already registered')) {
              message = 'That email address is already registered.';
            } else if (err.error) {
              message = err.error.message;
            } else {
              message = 'Registration failed.';
            }
            this.toastr.error(message,
              'Registration Error',
              {
                disableTimeOut: true
              });
            this.store$.dispatch(new AuthStoreActions.RegisterClearFailureAction());
          }
        }));
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
    this.store$.dispatch(new AuthStoreActions.RegisterRequestAction({
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    }));
  }

  onCancel() {
    this.navigateToReturnUrl();
  }

  private navigateToReturnUrl() {
    this.router.navigate(['/']);
  }
}
