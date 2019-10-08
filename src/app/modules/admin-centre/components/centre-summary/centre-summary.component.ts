import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Centre, CentreStateUIMap, CentreState } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modals/models';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState } from '@app/root-store';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, withLatestFrom, tap } from 'rxjs/operators';

@Component({
  selector: 'app-centre-summary',
  templateUrl: './centre-summary.component.html',
  styleUrls: ['./centre-summary.component.scss']
})
export class CentreSummaryComponent implements OnInit, OnDestroy {
  @ViewChild('updateNameModal', { static: false }) updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal', { static: false }) updateDescriptionModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;
  centre$: Observable<CentreUI>;
  centreStateUIMap = CentreStateUIMap;
  descriptionToggleLength = 80;
  getStateIcon = CentreUI.getStateIcon;
  getStateIconClass = CentreUI.getStateIconClass;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;
  menuItems: DropdownMenuItem[];

  private centreSubject = new BehaviorSubject(null);
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.centre$ = this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentreEntities),
      map(centres => {
        const centreEntity = centres[this.route.parent.snapshot.data.centre.id];
        if (centreEntity) {
          return centreEntity instanceof Centre ? centreEntity : new Centre().deserialize(centreEntity);
        }
        return undefined;
      }),
      tap(centre => {
        if (centre) {
          this.menuItems = this.createMenuItems(centre);
        }
      }),
      map(centre => (centre ? new CentreUI(centre) : undefined)),
      shareReplay()
    );

    this.centre$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.centreSubject);
    this.isLoading$ = this.centre$.pipe(map(centre => centre === undefined));

    this.centre$
      .pipe(
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([centre, msg]) => {
        if (msg === null) {
          return;
        }

        if (centre !== undefined) {
          this.toastr.success(msg, 'Update Successfull');
          this.updatedMessage$.next(null);

          if (centre.slug !== this.route.parent.snapshot.params.slug) {
            // name was changed and new slug was assigned
            //
            // need to change state since slug is used in URL and by breadcrumbs
            this.router.navigate(['../..', centre.slug, 'summary'], { relativeTo: this.route });
          }
        }
      });

    this.store$
      .pipe(
        select(CentreStoreSelectors.selectCentreError),
        filter(error => !!error),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage.indexOf('name already exists') > -1) {
          errMessage = 'A centre with that name already exists. Please use another name.';
        }
        this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateName() {
    this.whenCentreDisabled(centre => {
      this.updateNameModalOptions = {
        required: true,
        minLength: 2
      };
      this.modalService
        .open(this.updateNameModal)
        .result.then(value => {
          this.store$.dispatch(
            CentreStoreActions.updateCentreRequest({
              centre,
              attributeName: 'name',
              value
            })
          );
          this.updatedMessage$.next('Centre name was updated');
        })
        .catch(() => undefined);
    });
  }

  updateDescription() {
    this.whenCentreDisabled(centre => {
      this.updateDescriptionModalOptions = {
        rows: 20,
        cols: 10
      };
      this.modalService
        .open(this.updateDescriptionModal, { size: 'lg' })
        .result.then(value => {
          this.store$.dispatch(
            CentreStoreActions.updateCentreRequest({
              centre,
              attributeName: 'description',
              value: value ? value : undefined
            })
          );
          this.updatedMessage$.next('Centre description was updated');
        })
        .catch(() => undefined);
    });
  }

  disable() {
    this.changeState('disable');
  }

  enable() {
    this.changeState('enable');
  }

  private changeState(action: string) {
    const centre = this.centreSubject.value.entity;
    this.store$.dispatch(
      CentreStoreActions.updateCentreRequest({
        centre,
        attributeName: 'state',
        value: action
      })
    );
    this.updatedMessage$.next('Centre state was updated');
  }

  private whenCentreDisabled(fn: (centre: Centre) => void) {
    const centre = this.centreSubject.value.entity;
    if (!centre.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    fn(centre);
  }

  private createMenuItems(centre): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = [];

    if (centre.isDisabled()) {
      items.push(
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
        }
      );
    }

    if (centre.isDisabled() && centre.isEnableAllowed()) {
      items.push({
        kind: 'selectable',
        label: 'Enable this Study',
        icon: CentreUI.getStateIcon(CentreState.Enabled),
        iconClass: CentreUI.getStateIconClass(CentreState.Enabled),
        onSelected: () => {
          this.enable();
        }
      });
    }

    if (centre.isEnabled()) {
      items.push({
        kind: 'selectable',
        label: 'Disable this Study',
        icon: CentreUI.getStateIcon(CentreState.Disabled),
        iconClass: CentreUI.getStateIconClass(CentreState.Disabled),
        onSelected: () => {
          this.disable();
        }
      });
    }
    return items;
  }
}
