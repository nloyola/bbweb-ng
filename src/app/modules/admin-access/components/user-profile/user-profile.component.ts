import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserUI } from '@app/domain/users';
import { ModalInputTextOptions } from '@app/modules/modals/models';
import { RootStoreState, UserStoreActions, UserStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, withLatestFrom, tap } from 'rxjs/operators';
import { Dictionary } from '@ngrx/entity';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  @ViewChild('updateNameModal', { static: false }) updateNameModal: TemplateRef<any>;
  @ViewChild('updateEmailModal', { static: false }) updateEmailModal: TemplateRef<any>;
  @ViewChild('updateAvatarUrlModal', { static: false }) updateAvatarUrlModal: TemplateRef<any>;
  @ViewChild('updatePasswordModal', { static: false }) updatePasswordModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;
  user$: Observable<UserUI>;
  getStateIcon = UserUI.getStateIcon;
  getStateIconClass = UserUI.getStateIconClass;
  updateNameModalOptions: ModalInputTextOptions = {
    required: true,
    minLength: 2
  };
  updateEmailModalOptions: ModalInputTextOptions = {
    required: true
  };

  private userSubject = new BehaviorSubject(null);
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.user$ = this.store$.pipe(
      select(UserStoreSelectors.selectAllUserEntities),
      map((users: Dictionary<User>) => {
        const userEntity = users[this.route.snapshot.data.user.id];
        if (userEntity) {
          return userEntity instanceof User ? userEntity : new User().deserialize(userEntity);
        }
        return undefined;
      }),
      map(user => (user ? new UserUI(user) : undefined)),
      shareReplay()
    );

    this.user$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.userSubject);
    this.isLoading$ = this.user$.pipe(map(user => user === undefined));

    this.user$
      .pipe(
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([user, msg]) => {
        if (msg === null || user === undefined) {
          return;
        }

        this.toastr.success(msg, 'Update Successfull');
        this.updatedMessage$.next(null);

        if (user.slug !== this.route.snapshot.params.slug) {
          // name was changed and new slug was assigned
          //
          // need to change state since slug is used in URL and by breadcrumbs
          this.router.navigate(['..', user.slug], { relativeTo: this.route });
        }
      });

    this.store$
      .pipe(
        select(UserStoreSelectors.selectUserError),
        filter(error => !!error),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage.match(/EmailNotAvailable: user with email already exists/)) {
          errMessage = `That email address is in use by another user.`;
        }
        this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
      });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateName(): void {
    const user = this.userSubject.value.entity;
    this.modalService
      .open(this.updateNameModal, { size: 'lg' })
      .result.then(value => {
        this.store$.dispatch(
          UserStoreActions.updateUserRequest({
            user,
            attributeName: 'name',
            value
          })
        );
        this.updatedMessage$.next('User name was updated');
      })
      .catch(() => undefined);
  }

  updateEmail(): void {
    const user = this.userSubject.value.entity;
    this.modalService
      .open(this.updateEmailModal, { size: 'lg' })
      .result.then(value => {
        this.store$.dispatch(
          UserStoreActions.updateUserRequest({
            user,
            attributeName: 'email',
            value
          })
        );
        this.updatedMessage$.next('User  email was updated');
      })
      .catch(() => undefined);
  }

  updatePassword(): void {
    const user = this.userSubject.value.entity;
    this.modalService
      .open(this.updatePasswordModal, { size: 'lg' })
      .result.then(value => {
        this.store$.dispatch(
          UserStoreActions.updateUserRequest({
            user,
            attributeName: 'password',
            value
          })
        );
        this.updatedMessage$.next('User password was updated');
      })
      .catch(() => undefined);
  }

  updateAvatarUrl(): void {
    const user = this.userSubject.value.entity;
    this.modalService
      .open(this.updateAvatarUrlModal, { size: 'lg' })
      .result.then(value => {
        this.store$.dispatch(
          UserStoreActions.updateUserRequest({
            user,
            attributeName: 'avatarUrl',
            value
          })
        );
        this.updatedMessage$.next('User avatar URL was updated');
      })
      .catch(() => undefined);
  }

  activate(): void {
    this.changeState('activate');
  }

  lock(): void {
    this.changeState('lock');
  }

  unlock(): void {
    this.changeState('unlock');
  }

  private changeState(action: 'activate' | 'lock' | 'unlock') {
    const user = this.userSubject.value.entity;
    this.store$.dispatch(
      UserStoreActions.updateUserRequest({
        user,
        attributeName: 'state',
        value: action
      })
    );
    this.updatedMessage$.next('User state was updated');
  }
}
