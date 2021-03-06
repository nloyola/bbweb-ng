import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '@app/domain/access';
import { IUserInfo, User } from '@app/domain/users';
import { UserRemoveModalComponent } from '@app/modules/modals/components/user-remove-modal/user-remove-modal.component';
import { RoleStoreActions, RoleStoreSelectors, RootStoreState } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { UserAddTypeahead } from '@app/shared/typeaheads/user-add-typeahead';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-role-view',
  templateUrl: './role-view.component.html',
  styleUrls: ['./role-view.component.scss']
})
export class RoleViewComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  role$: Observable<Role>;
  userAddTypeahead: UserAddTypeahead;
  roleEntity: Role;
  roleId: string;

  private updatedMessage$ = new Subject<string>();
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) {
    this.userAddTypeahead = new UserAddTypeahead(
      this.store$,
      (users: User[]) => {
        // filter out users already linked to this membership
        const existingUserIds = this.roleEntity.userData.map(ud => ud.id);
        return users.filter(entity => existingUserIds.indexOf(entity.id) < 0);
      });

    this.userAddTypeahead.selected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user: User) => {
        this.store$.dispatch(new RoleStoreActions.UpdateRoleRequest({
          role: this.roleEntity,
          attributeName: 'userAdd',
          value: user.id
        }));

        this.updatedMessage$.next('User added');
      });

    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.role$ = this.store$.pipe(
      select(RoleStoreSelectors.selectAllRoles),
      filter(s => s.length > 0),
      map((roles: Role[]) => {
        const roleEntity = roles.find(u => u.slug === this.route.snapshot.params.slug);
        if (roleEntity) {
          return (roleEntity instanceof Role) ? roleEntity : new Role().deserialize(roleEntity);
        }
        throw new Error('role not found');
      }),
      tap(role => {
        this.roleEntity = role;
        this.roleId = role.id;
      }),
      shareReplay());

    this.role$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ role, msg ]) => {
      if (role === undefined) {
        throw new Error('role is undefined');
      }

      this.toastr.success(msg, 'Update Successfull');
      this.userAddTypeahead.clearSelected();
    });

    this.store$.pipe(
      select(RoleStoreSelectors.selectRoleError),
      filter(error => !!error),
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ error, _msg ]) => {
      const errMessage = error.error ? error.error.message : error.statusText;
      this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
    });
  }

  ngOnInit() {
    this.store$.dispatch(new RoleStoreActions.GetRoleRequest({
      slug: this.route.snapshot.params.slug
    }));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  userSelected(userInfo: IUserInfo): void {
    const modalRef = this.modalService.open(UserRemoveModalComponent);
    modalRef.componentInstance.user = userInfo;
    modalRef.result
      .then(() => {
        this.store$.dispatch(new RoleStoreActions.UpdateRoleRequest({
          role: this.roleEntity,
          attributeName: 'userRemove',
          value: userInfo.id
        }));

        this.updatedMessage$.next('User removed');
      })
      .catch(() => undefined);
  }

}
