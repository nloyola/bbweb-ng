import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@app/core/services';
import { User, UserState, UserUI } from '@app/domain/users';
import { ModalInputTextOptions } from '@app/modules/modals/models';
import { RootStoreState, UserStoreActions, UserStoreSelectors } from '@app/root-store';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from '@ngrx/entity';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

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
  menuItems: DropdownMenuItem[];

  private userSubject = new BehaviorSubject(null);
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notificationService: NotificationService
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
      filter(user => user !== undefined),
      tap(user => {
        this.menuItems = this.createSortMenuItems(user);
      }),
      map(user => (user ? new UserUI(user) : undefined)),
      shareReplay()
    );

    this.user$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.userSubject);
    this.isLoading$ = this.user$.pipe(map(user => user === undefined));

    this.user$
      .pipe(
        filter(user => user && this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(user => {
        this.notificationService.show();

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
        filter(error => !!error && this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(error => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage && errMessage.match(/EmailNotAvailable: user with email already exists/)) {
          errMessage = `That email address is in use by another user.`;
        }
        this.notificationService.showError(errMessage, 'Update Error');
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

        this.notificationService.add('Name was updated', 'Update Successfull');
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
        this.notificationService.add('Email address was updated', 'Update Successfull');
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
        this.notificationService.add('Password was updated', 'Update Successfull');
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
        this.notificationService.add('Avatar URL was updated', 'Update Successfull');
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
    this.notificationService.add('State was updated', 'Update Successfull');
  }

  private createSortMenuItems(user: User): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'Update Name',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateName();
        }
      },
      {
        kind: 'selectable',
        label: 'Update Email',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateEmail();
        }
      },
      {
        kind: 'selectable',
        label: 'Change Avatar',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateAvatarUrl();
        }
      }
    ];

    if (user.isRegistered()) {
      items.push({
        kind: 'selectable',
        label: 'Activate User',
        icon: this.getStateIcon(UserState.Active),
        iconClass: this.getStateIconClass(UserState.Active),
        onSelected: () => {
          this.activate();
        }
      });
    }

    if (user.isActive()) {
      items.push({
        kind: 'selectable',
        label: 'Lock User',
        icon: this.getStateIcon(UserState.Locked),
        iconClass: this.getStateIconClass(UserState.Locked),
        onSelected: () => {
          this.lock();
        }
      });
    }

    if (user.isLocked()) {
      items.push({
        kind: 'selectable',
        label: 'Unlock User',
        icon: this.getStateIcon(UserState.Active),
        iconClass: this.getStateIconClass(UserState.Active),
        onSelected: () => {
          this.unlock();
        }
      });
    }

    return items;
  }
}
