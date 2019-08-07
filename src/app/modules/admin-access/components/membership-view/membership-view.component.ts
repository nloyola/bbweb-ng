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
import { CentreSelectTypeahead, StudySelectTypeahead, UserSelectTypeahead } from '@app/shared/typeaheads';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from '@ngrx/entity';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-membership-view',
  templateUrl: './membership-view.component.html',
  styleUrls: ['./membership-view.component.scss']
})
export class MembershipViewComponent implements OnInit, OnDestroy {
  @ViewChild('updateNameModal', { static: false }) updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal', { static: false }) updateDescriptionModal: TemplateRef<any>;
  @ViewChild('allStudiesModal', { static: false }) allStudiesModal: TemplateRef<any>;
  @ViewChild('allCentresModal', { static: false }) allCentresModal: TemplateRef<any>;
  @ViewChild('removeMembershipModal', { static: false }) removeMembershipModal: TemplateRef<any>;

  changesAllowed = true;
  isLoading$: Observable<boolean>;
  membership$: Observable<Membership>;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;
  userAddTypeahead: UserSelectTypeahead;
  studyAddTypeahead: StudySelectTypeahead;
  centreAddTypeahead: CentreSelectTypeahead;
  isRemoving = false;

  private membershipSubject = new BehaviorSubject(null);
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.createUserTypeahead();
    this.createStudyTypeahead();
    this.createCentreTypeahead();

    this.membership$ = this.store$.pipe(
      select(MembershipStoreSelectors.selectAllMembershipEntities),
      map((memberships: Dictionary<Membership>) => {
        const membershipEntity = memberships[this.route.snapshot.data.membership.id];

        if (membershipEntity) {
          return membershipEntity instanceof Membership
            ? membershipEntity
            : new Membership().deserialize(membershipEntity);
        }

        return undefined;
      }),
      shareReplay()
    );

    this.membership$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.membershipSubject);
    this.isLoading$ = this.membership$.pipe(map(membership => membership === undefined));

    this.membership$
      .pipe(
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([membership, msg]) => {
        if (msg === null) {
          return;
        }

        if (membership !== undefined) {
          this.toastr.success(msg, 'Update Successfull');

          this.userAddTypeahead.clearSelected();
          this.studyAddTypeahead.clearSelected();
          this.centreAddTypeahead.clearSelected();

          if (membership.slug !== this.route.snapshot.params.slug) {
            // name was changed and new slug was assigned
            //
            // need to change state since slug is used in URL and by breadcrumbs
            this.router.navigate(['..', membership.slug], { relativeTo: this.route });
          }
        } else {
          this.router.navigate(['..'], { relativeTo: this.route });
          this.toastr.success(msg, 'Remove Successfull');
        }
        this.updatedMessage$.next(null);
      });

    this.store$
      .pipe(
        select(MembershipStoreSelectors.selectMembershipError),
        filter(error => !!error),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage.indexOf('name already used') > -1) {
          errMessage = 'A membership with that name already exists. Please use another name.';
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
    const membership = this.membershipSubject.value;
    this.updateNameModalOptions = {
      required: true,
      minLength: 2
    };
    this.modalService
      .open(this.updateNameModal, { size: 'lg' })
      .result.then(value => {
        this.store$.dispatch(
          MembershipStoreActions.updateMembershipRequest({
            membership,
            attributeName: 'name',
            value
          })
        );
        this.updatedMessage$.next('User name was updated');
      })
      .catch(() => undefined);
  }

  updateDescription() {
    const membership = this.membershipSubject.value;
    this.updateDescriptionModalOptions = {
      rows: 3,
      cols: 10
    };
    this.modalService
      .open(this.updateDescriptionModal, { size: 'lg' })
      .result.then(value => {
        this.store$.dispatch(
          MembershipStoreActions.updateMembershipRequest({
            membership,
            attributeName: 'description',
            value: value ? value : undefined
          })
        );
        this.updatedMessage$.next('Membership description was updated');
      })
      .catch(() => undefined);
  }

  userSelected(userInfo: IUserInfo): void {
    const membership = this.membershipSubject.value;
    const modalRef = this.modalService.open(UserRemoveModalComponent);
    modalRef.componentInstance.user = userInfo;
    modalRef.result
      .then(() => {
        this.store$.dispatch(
          MembershipStoreActions.updateMembershipRequest({
            membership,
            attributeName: 'userRemove',
            value: userInfo.id
          })
        );

        this.updatedMessage$.next('User removed');
      })
      .catch(() => undefined);
  }

  studySelected(studyInfo: IUserInfo): void {
    const membership = this.membershipSubject.value;
    const removeStudy = () => {
      this.store$.dispatch(
        MembershipStoreActions.updateMembershipRequest({
          membership,
          attributeName: 'studyRemove',
          value: studyInfo.id
        })
      );

      this.updatedMessage$.next('Study removed');
    };

    const modalRef = this.modalService.open(StudyRemoveModalComponent);
    modalRef.componentInstance.study = studyInfo;
    modalRef.result
      .then(() => {
        if (membership.studyData.entityData.length > 1) {
          removeStudy();
          return;
        }

        // no more studies in set, ask user if membership should be for all studies?
        this.modalService
          .open(this.allStudiesModal)
          .result.then(() => {
            this.store$.dispatch(
              MembershipStoreActions.updateMembershipRequest({
                membership,
                attributeName: 'allStudies'
              })
            );

            this.updatedMessage$.next('Membership now applies to all studies');
          })
          .catch(() => {
            removeStudy();
          });
      })
      .catch(() => undefined);
  }

  centreSelected(centreInfo: IUserInfo): void {
    const membership = this.membershipSubject.value;
    const removeCentre = () => {
      this.store$.dispatch(
        MembershipStoreActions.updateMembershipRequest({
          membership,
          attributeName: 'centreRemove',
          value: centreInfo.id
        })
      );

      this.updatedMessage$.next('Centre removed');
    };

    const modalRef = this.modalService.open(CentreRemoveModalComponent);
    modalRef.componentInstance.centre = centreInfo;
    modalRef.result
      .then(() => {
        if (membership.centreData.entityData.length > 1) {
          removeCentre();
          return;
        }

        // no more centres in set, ask user if membership should be for all centres?
        this.modalService
          .open(this.allCentresModal)
          .result.then(() => {
            this.store$.dispatch(
              MembershipStoreActions.updateMembershipRequest({
                membership,
                attributeName: 'allCentres'
              })
            );

            this.updatedMessage$.next('Membership now applies to all centres');
          })
          .catch(() => {
            removeCentre();
          });
      })
      .catch(() => undefined);
  }

  removeMembership() {
    const membership = this.membershipSubject.value;
    const modalRef = this.modalService.open(this.removeMembershipModal);
    modalRef.result
      .then(() => {
        this.store$.dispatch(
          MembershipStoreActions.removeMembershipRequest({
            membership
          })
        );
        this.updatedMessage$.next('Memberhsip Removed');
      })
      .catch(() => undefined);
  }

  private createUserTypeahead() {
    this.userAddTypeahead = new UserSelectTypeahead(this.store$, (users: User[]) => {
      // filter out users already linked to this membership
      const membership = this.membershipSubject.value;
      const existingUserIds = membership.userData.map(ud => ud.id);
      return users.filter(entity => existingUserIds.indexOf(entity.id) < 0);
    });

    this.userAddTypeahead.selected$.pipe(takeUntil(this.unsubscribe$)).subscribe((user: User) => {
      const membership = this.membershipSubject.value;
      this.store$.dispatch(
        MembershipStoreActions.updateMembershipRequest({
          membership,
          attributeName: 'userAdd',
          value: user.id
        })
      );

      this.updatedMessage$.next('User added');
    });
  }

  private createStudyTypeahead() {
    this.studyAddTypeahead = new StudySelectTypeahead(this.store$, (studys: Study[]) => {
      const membership = this.membershipSubject.value;
      // filter out studys already linked to this membership
      const existingStudyIds = membership.studyData.entityData.map(sd => sd.id);
      return studys.filter(entity => existingStudyIds.indexOf(entity.id) < 0);
    });

    this.studyAddTypeahead.selected$.pipe(takeUntil(this.unsubscribe$)).subscribe((study: Study) => {
      const membership = this.membershipSubject.value;
      this.store$.dispatch(
        MembershipStoreActions.updateMembershipRequest({
          membership,
          attributeName: 'studyAdd',
          value: study.id
        })
      );

      this.updatedMessage$.next('Study added');
    });
  }

  private createCentreTypeahead() {
    this.centreAddTypeahead = new CentreSelectTypeahead(this.store$, (centres: Centre[]) => {
      const membership = this.membershipSubject.value;
      // filter out centres already linked to this membership
      const existingCentreIds = membership.centreData.entityData.map(sd => sd.id);
      return centres.filter(entity => existingCentreIds.indexOf(entity.id) < 0);
    });

    this.centreAddTypeahead.selected$.pipe(takeUntil(this.unsubscribe$)).subscribe((centre: Centre) => {
      const membership = this.membershipSubject.value;
      this.store$.dispatch(
        MembershipStoreActions.updateMembershipRequest({
          membership,
          attributeName: 'centreAdd',
          value: centre.id
        })
      );

      this.updatedMessage$.next('Centre added');
    });
  }
}
