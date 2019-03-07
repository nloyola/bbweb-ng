import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserUI } from '@app/domain/users';
import { RootStoreState, UserStoreActions, UserStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { select, Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ModalInputTextOptions } from '@app/modules/modals/models';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  @ViewChild('updateNameModal') updateNameModal: TemplateRef<any>;
  @ViewChild('updateEmailModal') updateEmailModal: TemplateRef<any>;
  @ViewChild('updateAvatarUrlModal') updateAvatarUrlModal: TemplateRef<any>;
  @ViewChild('updatePasswordModal') updatePasswordModal: TemplateRef<any>;

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

  private userEntity: User;
  private userId: string;
  private updatedMessage: string;

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) {
    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.user$ = this.store$.pipe(
      select(UserStoreSelectors.selectAllUsers),
      filter(s => s.length > 0),
      map((users: User[]) => {
        const userEntity = users.find(u => u.slug === this.route.snapshot.params.slug);
        if (userEntity) {
          this.userEntity = (userEntity instanceof User) ? userEntity : new User().deserialize(userEntity);
          this.userId = userEntity.id;
          if (this.updatedMessage) {
            this.toastr.success(this.updatedMessage, 'Update Successfull');
            this.updatedMessage = undefined;
          }
          return this.userEntity;
        }

        if (!this.userId) {
          return undefined;
        }

        this.userEntity = undefined;
        const userById = users.find(u => u.id === this.userId);
        if (userById) {
          this.router.navigate([ '..', userById.slug ], { relativeTo: this.route });
          this.userEntity = (userById instanceof User) ? userById : new User().deserialize(userById);
          if (this.updatedMessage) {
            this.toastr.success(this.updatedMessage, 'Update Successfull');
          }
          return this.userEntity;
        }

        this.router.navigate([ '..' ], { relativeTo: this.route });
        return undefined;
      }),
      filter(user => user !== undefined),
      map(user => new UserUI(user)));
  }

  ngOnInit() {
    this.store$.dispatch(new UserStoreActions.GetUserRequest({
      slug: this.route.snapshot.params.slug
    }));
  }

  updateName(): void {
    this.modalService.open(this.updateNameModal, { size: 'lg' }).result
      .then(value => {
        this.store$.dispatch(new UserStoreActions.UpdateUserRequest({
          user: this.userEntity,
          attributeName: 'name',
          value
        }));
        this.updatedMessage = 'User name was updated';
      })
      .catch(() => undefined);
  }

  updateEmail(): void {
    this.modalService.open(this.updateEmailModal, { size: 'lg' }).result
      .then(value => {
        this.store$.dispatch(new UserStoreActions.UpdateUserRequest({
          user: this.userEntity,
          attributeName: 'email',
          value
        }));
        this.updatedMessage = 'User  email was updated';
      })
      .catch(() => undefined);
  }

  updatePassword(): void {
    this.modalService.open(this.updatePasswordModal, { size: 'lg' }).result
      .then(value => {
        this.store$.dispatch(new UserStoreActions.UpdateUserRequest({
          user: this.userEntity,
          attributeName: 'password',
          value
        }));
        this.updatedMessage = 'User password was updated';
      })
      .catch(() => undefined);
  }

  updateAvatarUrl(): void {
    this.modalService.open(this.updateAvatarUrlModal, { size: 'lg' }).result
      .then(value => {
        this.store$.dispatch(new UserStoreActions.UpdateUserRequest({
          user: this.userEntity,
          attributeName: 'avatarUrl',
          value
        }));
        this.updatedMessage = 'User avatar URL was updated';
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
    this.store$.dispatch(new UserStoreActions.UpdateUserRequest({
      user: this.userEntity,
      attributeName: 'state',
      value: action
    }));
    this.updatedMessage = 'User state was updated';
  }

}
