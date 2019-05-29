import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Membership } from '@app/domain/access';
import { Centre } from '@app/domain/centres';
import { Study } from '@app/domain/studies';
import { IUserInfo, User } from '@app/domain/users';
import { CentreRemoveModalComponent } from '@app/modules/modals/components/centre-remove-modal/centre-remove-modal.component';
import { StudyRemoveModalComponent } from '@app/modules/modals/components/study-remove-modal/study-remove-modal.component';
import { UserRemoveModalComponent } from '@app/modules/modals/components/user-remove-modal/user-remove-modal.component';
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
import { map, shareReplay, takeUntil, tap, withLatestFrom, filter } from 'rxjs/operators';

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
  membershipEntity: Membership;
  membershipId: string;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;
  userAddTypeahead: UserAddTypeahead;
  studyAddTypeahead: StudyAddTypeahead;
  centreAddTypeahead: CentreAddTypeahead;
  isRemoving = false;

  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

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
          return (membershipEntity instanceof Membership)
            ? membershipEntity : new Membership().deserialize(membershipEntity);
        }

        if (this.membershipId) {
          const membershipById = memberships.find(u => u.id === this.membershipId);
          if (membershipById) {
            return (membershipById instanceof Membership)
              ? membershipById : new Membership().deserialize(membershipById);
          }
        }

        return undefined;
      }),
      tap((membership) => {
        if (membership) {
          this.membershipId = membership.id;
          this.membershipEntity = membership;
        }
      }),
      shareReplay());

    this.membership$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ membership, msg ]) => {
      if (membership !== undefined) {
        this.toastr.success(msg, 'Update Successfull');
        this.userAddTypeahead.clearSelected();
        this.studyAddTypeahead.clearSelected();
        this.centreAddTypeahead.clearSelected();

        if (membership.slug !== this.route.snapshot.params.slug) {
          // name was changed and new slug was assigned
          //
          // need to change state since slug is used in URL and by breadcrumbs
          this.router.navigate([ '..', membership.slug ], { relativeTo: this.route });
        }
      } else {
        this.router.navigate([ '..' ], { relativeTo: this.route });
        this.toastr.success('Membership removed', 'Remove Successfull');
      }
    });

    this.store$.pipe(
      select(MembershipStoreSelectors.selectMembershipError),
      filter(error => !!error),
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ error, _msg ]) => {
      let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
      if (errMessage.indexOf('name already used') > -1) {
        errMessage = 'A membership with that name already exists. Please use another name.';
      }
      this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
    });
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
        this.updatedMessage$.next('User name was updated');
      })
      .catch(() => undefined);
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
        this.updatedMessage$.next('Membership description was updated');
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

        this.updatedMessage$.next('User removed');
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

      this.updatedMessage$.next('Study removed');
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

            this.updatedMessage$.next('Membership now applies to all studies');
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

      this.updatedMessage$.next('Centre removed');
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

            this.updatedMessage$.next('Membership now applies to all centres');
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
        this.updatedMessage$.next('Memberhsip Removed');
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

        this.updatedMessage$.next('User added');
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

        this.updatedMessage$.next('Study added');
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

        this.updatedMessage$.next('Centre added');
    });
  }

}
