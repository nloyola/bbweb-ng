import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Membership } from '@app/domain/access';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modal-input/models';
import { MembershipStoreActions, MembershipStoreSelectors, RootStoreState } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { UserAddTypeahead } from '@app/shared/typeaheads/user-add-typeahead';
import { User } from '@app/domain/users';
import { EntityInfo } from '@app/domain';

@Component({
  selector: 'app-membership-view',
  templateUrl: './membership-view.component.html',
  styleUrls: ['./membership-view.component.scss']
})
export class MembershipViewComponent implements OnInit {

  @ViewChild('updateNameModal') updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal') updateDescriptionModal: TemplateRef<any>;

  changesAllowed = true;
  isLoading$: Observable<boolean>;
  membership$: Observable<Membership>;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;
  userAddTypeahead: UserAddTypeahead;

  private membershipEntity: Membership;
  private membershipId: string;
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
        const existingUserIds = this.membershipEntity.userData.map(ud => ud.id);
        return users.filter(entity => existingUserIds.indexOf(entity.id) < 0);
      });

    this.userAddTypeahead.selected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user: User) => {
      this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
        membership: this.membershipEntity,
        attributeName: 'userAdd',
        value: user.id
      }));

      this.updatedMessage = 'User added';
    });

    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.membership$ = this.store$.pipe(
      select(MembershipStoreSelectors.selectAllMemberships),
      filter(s => s.length > 0),
      map((memberships: Membership[]) => {
        const membershipEntity = memberships.find(u => u.slug === this.route.snapshot.params.slug);
        if (membershipEntity) {
          this.membershipEntity = (membershipEntity instanceof Membership)
            ? membershipEntity : new Membership().deserialize(membershipEntity);
          this.membershipId = membershipEntity.id;
          if (this.updatedMessage) {
            this.toastr.success(this.updatedMessage, 'Update Successfull');
            this.updatedMessage = undefined;
            this.userAddTypeahead.clearSelected();
          }
          return this.membershipEntity;
        }

        if (!this.membershipId) {
          return undefined;
        }

        this.membershipEntity = undefined;
        const membershipById = memberships.find(u => u.id === this.membershipId);
        if (membershipById) {
          this.router.navigate([ '..', membershipById.slug ], { relativeTo: this.route });
          this.membershipEntity = (membershipById instanceof Membership) ? membershipById : new Membership().deserialize(membershipById);
          if (this.updatedMessage) {
            this.toastr.success(this.updatedMessage, 'Update Successfull');
          }
          return this.membershipEntity;
        }

        this.router.navigate([ '..' ], { relativeTo: this.route });
        return undefined;
      }),
      filter(membership => membership !== undefined));
  }

  ngOnInit() {
    this.store$.dispatch(new MembershipStoreActions.GetMembershipRequest({
      slug: this.route.snapshot.params.slug
    }));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateName(): void {
    this.updateNameModalOptions = {
      required: true,
      minLength: 2
    };
    this.modalService.open(this.updateNameModal, { size: 'lg' }).result
      .then(result => {
        if (result.confirmed) {
          this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
            membership: this.membershipEntity,
            attributeName: 'name',
            value: result.value
          }));
          this.updatedMessage = 'User name was updated';
        }
      })
      .catch(err => console.log('err', err));
  }

  updateDescription() {
    this.updateDescriptionModalOptions = {
      rows: 3,
      cols: 10
    };
    this.modalService.open(this.updateDescriptionModal, { size: 'lg' }).result
      .then(value => {
        if (value.confirmed) {
          this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
            membership: this.membershipEntity,
            attributeName: 'description',
            value: value.value ? value.value : undefined
          }));
          this.updatedMessage = 'Membership description was updated';
        }
      })
      .catch(err => console.log('err', err));
  }

  userSelected(userInfo: EntityInfo): void {
    console.log(userInfo);
  }

}
