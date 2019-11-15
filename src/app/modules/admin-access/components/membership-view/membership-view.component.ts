import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@app/core/services';
import { Membership } from '@app/domain/access';
import { Centre, CentreInfo, CentreStateInfo } from '@app/domain/centres';
import { Study, StudyInfo, StudyStateInfo } from '@app/domain/studies';
import { IUserInfo, User, UserInfo } from '@app/domain/users';
import { CentreRemoveModalComponent } from '@app/modules/modals/components/centre-remove-modal/centre-remove-modal.component';
import { StudyRemoveModalComponent } from '@app/modules/modals/components/study-remove-modal/study-remove-modal.component';
import { UserRemoveModalComponent } from '@app/modules/modals/components/user-remove-modal/user-remove-modal.component';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modals/models';
import { MembershipStoreActions, MembershipStoreSelectors, RootStoreState } from '@app/root-store';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { CentreSelectTypeahead, StudySelectTypeahead, UserSelectTypeahead } from '@app/shared/typeaheads';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from '@ngrx/entity';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil } from 'rxjs/operators';

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
  menuItems: DropdownMenuItem[];

  private membershipSubject = new BehaviorSubject(null);
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notificationService: NotificationService
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
        filter(() => this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(membership => {
        this.notificationService.show();
        if (membership !== undefined) {
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
        }
      });

    this.store$
      .pipe(
        select(MembershipStoreSelectors.selectMembershipError),
        filter(error => !!error && this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(error => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage && errMessage.indexOf('name already used') > -1) {
          errMessage = 'A membership with that name already exists. Please use another name.';
        }
        this.notificationService.showError(errMessage, 'Update Error');
      });
  }

  ngOnInit() {
    this.menuItems = this.createMenuItems();
  }

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
        this.notificationService.add('User name was updated', 'Update Successfull');
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
        this.notificationService.add('Membership description was updated', 'Update Successfull');
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

        this.notificationService.add('User removed', 'Update Successfull');
      })
      .catch(() => undefined);
  }

  studySelected(studyInfo: StudyStateInfo): void {
    const membership = this.membershipSubject.value;
    const removeStudy = () => {
      this.store$.dispatch(
        MembershipStoreActions.updateMembershipRequest({
          membership,
          attributeName: 'studyRemove',
          value: studyInfo.id
        })
      );

      this.notificationService.add('Study removed', 'Update Successfull');
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

            this.notificationService.add('Membership now applies to all studies', 'Update Successfull');
          })
          .catch(() => {
            removeStudy();
          });
      })
      .catch(() => undefined);
  }

  centreSelected(centreInfo: CentreStateInfo): void {
    const membership = this.membershipSubject.value;
    const removeCentre = () => {
      this.store$.dispatch(
        MembershipStoreActions.updateMembershipRequest({
          membership,
          attributeName: 'centreRemove',
          value: centreInfo.id
        })
      );

      this.notificationService.add('Centre removed', 'Update Successfull');
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

            this.notificationService.add('Membership now applies to all centres', 'Update Successfull');
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
        this.notificationService.add('Memberhsip Removed', 'Remove Successful');
      })
      .catch(() => undefined);
  }

  private createUserTypeahead() {
    this.userAddTypeahead = new UserSelectTypeahead(this.store$, (users: User[]) => {
      // filter out users already linked to this membership
      const membership = this.membershipSubject.value;
      const existingUserIds = membership.userData.map((userData: UserInfo) => userData.id);
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

      this.notificationService.add('User added', 'Update Successfull');
    });
  }

  private createStudyTypeahead() {
    this.studyAddTypeahead = new StudySelectTypeahead(this.store$, (studies: Study[]) => {
      const membership = this.membershipSubject.value;
      // filter out studys already linked to this membership
      const existingStudyIds = membership.studyData.entityData.map((studyInfo: StudyInfo) => studyInfo.id);
      return studies.filter(entity => existingStudyIds.indexOf(entity.id) < 0);
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

      this.notificationService.add('Study added', 'Update Successfull');
    });
  }

  private createCentreTypeahead() {
    this.centreAddTypeahead = new CentreSelectTypeahead(this.store$, (centres: Centre[]) => {
      const membership = this.membershipSubject.value;
      // filter out centres already linked to this membership
      const existingCentreIds = membership.centreData.entityData.map(
        (centreInfo: CentreInfo) => centreInfo.id
      );
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

      this.notificationService.add('Centre added', 'Update Successfull');
    });
  }

  private createMenuItems(): DropdownMenuItem[] {
    return [
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
        label: 'Update Description',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateDescription();
        }
      },
      {
        kind: 'selectable',
        label: 'Remove Membership',
        icon: 'remove_circle',
        iconClass: 'danger-icon',
        onSelected: () => {
          this.removeMembership();
        }
      }
    ];
  }
}
