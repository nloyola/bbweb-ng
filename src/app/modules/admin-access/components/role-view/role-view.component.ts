import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityInfo } from '@app/domain';
import { Role } from '@app/domain/access';
import { User } from '@app/domain/users';
import { UserRemoveModalComponent } from '@app/modules/modal-input/components/user-remove-modal/user-remove-modal.component';
import { ModalInputResult } from '@app/modules/modal-input/models';
import { RoleStoreActions, RoleStoreSelectors, RootStoreState } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { UserAddTypeahead } from '@app/shared/typeaheads/user-add-typeahead';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-role-view',
  templateUrl: './role-view.component.html',
  styleUrls: ['./role-view.component.scss']
})
export class RoleViewComponent implements OnInit {

  isLoading$: Observable<boolean>;
  role$: Observable<Role>;
  userAddTypeahead: UserAddTypeahead;

  private roleEntity: Role;
  private roleId: string;
  private updatedMessage: string;

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

        this.updatedMessage = 'User added';
      });

    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.role$ = this.store$.pipe(
      select(RoleStoreSelectors.selectAllRoles),
      filter(s => s.length > 0),
      map((roles: Role[]) => {
        const roleEntity = roles.find(u => u.slug === this.route.snapshot.params.slug);
        if (roleEntity) {
          this.roleEntity = (roleEntity instanceof Role) ? roleEntity : new Role().deserialize(roleEntity);
          this.roleId = roleEntity.id;
          if (this.updatedMessage) {
            this.toastr.success(this.updatedMessage, 'Update Successfull');
            this.updatedMessage = undefined;
            this.userAddTypeahead.clearSelected();
          }
          return this.roleEntity;
        }

        if (!this.roleId) {
          return undefined;
        }

        this.roleEntity = undefined;
        const roleById = roles.find(u => u.id === this.roleId);
        if (roleById) {
          this.router.navigate([ '..', roleById.slug ], { relativeTo: this.route });
          this.roleEntity = (roleById instanceof Role) ? roleById : new Role().deserialize(roleById);
          if (this.updatedMessage) {
            this.toastr.success(this.updatedMessage, 'Update Successfull');
          }
          return this.roleEntity;
        }

        this.router.navigate([ '..' ], { relativeTo: this.route });
        return undefined;
      }),
      filter(role => role !== undefined));
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

  userSelected(userInfo: EntityInfo): void {
    const modalRef = this.modalService.open(UserRemoveModalComponent);
    modalRef.componentInstance.user = userInfo;
    modalRef.result
      .then((result: ModalInputResult) => {
        if (result.confirmed) {
          this.store$.dispatch(new RoleStoreActions.UpdateRoleRequest({
            role: this.roleEntity,
            attributeName: 'userRemove',
            value: userInfo.id
          }));

          this.updatedMessage = 'User removed';
        }
      })
      .catch(err => console.log('err', err));
  }

}
