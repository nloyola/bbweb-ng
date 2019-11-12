import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStoreActions, AuthStoreSelectors, RootStoreState } from '@app/root-store';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('modal', { static: true }) private modal: ElementRef;

  private unsubscribe$: Subject<void> = new Subject<void>();
  isLoggingIn$ = new BehaviorSubject<boolean>(false);
  returnUrl: string;
  loginForm: FormGroup;
  faSpinner = faSpinner;

  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder
  ) {}

  public ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.store$
      .pipe(
        select(AuthStoreSelectors.selectAuthUser),
        filter(user => user !== null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.isLoggingIn$.next(false);
        this.navigateToReturnUrl();
      });

    this.store$
      .pipe(
        select(AuthStoreSelectors.selectAuthError),
        filter(err => err !== null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        this.isLoggingIn$.next(false);
        this.store$.dispatch(AuthStoreActions.loginClearFailureAction());
        this.modalService
          .open(this.modal, { ariaLabelledBy: 'modal-basic-title' })
          .result.then(() => this.navigateToReturnUrl())
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

  onSubmit() {
    this.store$.dispatch(
      AuthStoreActions.loginRequestAction({
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      })
    );
    this.isLoggingIn$.next(true);
  }

  private navigateToReturnUrl() {
    this.router.navigate([this.returnUrl]);
  }
}
