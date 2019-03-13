import { Component, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityInfo } from '@app/domain';
import { Membership } from '@app/domain/access';
import { Study } from '@app/domain/studies';
import { User, IUserInfo } from '@app/domain/users';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modals/models';
import { MembershipStoreActions, MembershipStoreSelectors, RootStoreState } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { CentreAddTypeahead } from '@app/shared/typeaheads/centre-add-typeahead';
import { StudyAddTypeahead } from '@app/shared/typeaheads/study-add-typeahead';
import { UserAddTypeahead } from '@app/shared/typeaheads/user-add-typeahead';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Centre } from '@app/domain/centres';
import { StudyRemoveModalComponent } from '@app/modules/modals/components/study-remove-modal/study-remove-modal.component';
import { UserRemoveModalComponent } from '@app/modules/modals/components/user-remove-modal/user-remove-modal.component';
import { CentreRemoveModalComponent } from '@app/modules/modals/components/centre-remove-modal/centre-remove-modal.component';

@Component({
  selector: 'app-membership-view',
  templateUrl: './membership-view.component.html',
  styleUrls: ['./membership-view.component.scss']
})
export class MembershipViewComponent implements OnInit, OnDestroy {

  @ViewChild('updateNameModal') updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal') updateDescriptionModal: TemplateRef<any>;
  @ViewChild('allStudiesModal') allStudiesModal: TemplateRef<any>;
  @ViewChild('allCentresModal') allCentresModal: TemplateRef<any>;
  @ViewChild('removeMembershipModal') removeMembershipModal: TemplateRef<any>;

  changesAllowed = true;
  isLoading$: Observable<boolean>;
  membership$: Observable<Membership>;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;
  userAddTypeahead: UserAddTypeahead;
  studyAddTypeahead: StudyAddTypeahead;
  centreAddTypeahead: CentreAddTypeahead;
  isRemoving = false;

  private membershipEntity: Membership;
  private membershipId: string;
  private updatedMessage: string;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) {
    this.createUserTypeahead();
    this.createStudyTypeahead();
    this.createCentreTypeahead();

    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.membership$ = this.store$.pipe(
      select(MembershipStoreSelectors.selectAllMemberships),
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
            this.studyAddTypeahead.clearSelected();
            this.centreAddTypeahead.clearSelected();
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
          this.membershipEntity = (membershipById instanceof Membership)
            ? membershipById : new Membership().deserialize(membershipById);
          if (this.updatedMessage) {
            this.toastr.success(this.updatedMessage, 'Update Successfull');
          }
          return this.membershipEntity;
        }

        this.router.navigate([ '..' ], { relativeTo: this.route });
        this.toastr.success('Membership removed', 'Remove Successfull');
        this.isRemoving = false;
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
      .then(value => {
        this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
          membership: this.membershipEntity,
          attributeName: 'name',
          value
        }));
        this.updatedMessage = 'User name was updated';
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
        this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
          membership: this.membershipEntity,
          attributeName: 'description',
          value: value ? value : undefined
        }));
        this.updatedMessage = 'Membership description was updated';
      })
      .catch(() => undefined);
  }

  userSelected(userInfo: IUserInfo): void {
    const modalRef = this.modalService.open(UserRemoveModalComponent);
    modalRef.componentInstance.user = userInfo;
    modalRef.result
      .then(() => {
        this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
          membership: this.membershipEntity,
          attributeName: 'userRemove',
          value: userInfo.id
        }));

        this.updatedMessage = 'User removed';
      })
      .catch(() => undefined);
  }

  studySelected(studyInfo: IUserInfo): void {
    const removeStudy = () => {
      this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
        membership: this.membershipEntity,
        attributeName: 'studyRemove',
        value: studyInfo.id
      }));

      this.updatedMessage = 'Study removed';
    };

    const modalRef = this.modalService.open(StudyRemoveModalComponent);
    modalRef.componentInstance.study = studyInfo;
    modalRef.result
      .then(() => {
        if (this.membershipEntity.studyData.entityData.length > 1) {
          removeStudy();
          return;
        }

        // no more studies in set, ask user if membership should be for all studies?
        this.modalService.open(this.allStudiesModal).result
          .then(() => {
            this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
              membership: this.membershipEntity,
              attributeName: 'allStudies'
            }));

            this.updatedMessage = 'Membership now applies to all studies';
          })
          .catch(() => {
            removeStudy();
          });
      })
      .catch(() => undefined);
  }

  centreSelected(centreInfo: IUserInfo): void {
    const removeCentre = () => {
      this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
        membership: this.membershipEntity,
        attributeName: 'centreRemove',
        value: centreInfo.id
      }));

      this.updatedMessage = 'Centre removed';
    };

    const modalRef = this.modalService.open(CentreRemoveModalComponent);
    modalRef.componentInstance.centre = centreInfo;
    modalRef.result
      .then(() => {
        if (this.membershipEntity.centreData.entityData.length > 1) {
          removeCentre();
          return;
        }

        // no more centres in set, ask user if membership should be for all centres?
        this.modalService.open(this.allCentresModal).result
          .then(() => {
            this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
              membership: this.membershipEntity,
              attributeName: 'allCentres'
            }));

            this.updatedMessage = 'Membership now applies to all centres';
          })
          .catch(() => {
            removeCentre();
          });
      })
      .catch(() => undefined);
  }

  removeMembership() {
    const modalRef = this.modalService.open(this.removeMembershipModal);
    modalRef.result
      .then(() => {
        this.store$.dispatch(new MembershipStoreActions.RemoveMembershipRequest({
          membership: this.membershipEntity
        }));
        this.isRemoving = true;
      })
      .catch(() => undefined);
  }

  private createUserTypeahead() {
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
  }

  private createStudyTypeahead() {
    this.studyAddTypeahead = new StudyAddTypeahead(
      this.store$,
      (studys: Study[]) => {
        // filter out studys already linked to this membership
        const existingStudyIds = this.membershipEntity.studyData.entityData.map(sd => sd.id);
        return studys.filter(entity => existingStudyIds.indexOf(entity.id) < 0);
      });

    this.studyAddTypeahead.selected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((study: Study) => {
      this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
        membership: this.membershipEntity,
        attributeName: 'studyAdd',
        value: study.id
      }));

      this.updatedMessage = 'Study added';
    });
  }

  private createCentreTypeahead() {
    this.centreAddTypeahead = new CentreAddTypeahead(
      this.store$,
      (centres: Centre[]) => {
        // filter out centres already linked to this membership
        const existingCentreIds = this.membershipEntity.centreData.entityData.map(sd => sd.id);
        return centres.filter(entity => existingCentreIds.indexOf(entity.id) < 0);
      });

    this.centreAddTypeahead.selected$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((centre: Centre) => {
      this.store$.dispatch(new MembershipStoreActions.UpdateMembershipRequest({
        membership: this.membershipEntity,
        attributeName: 'centreAdd',
        value: centre.id
      }));

      this.updatedMessage = 'Centre added';
    });
  }

}
