import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Centre, CentreStateUIMap } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modals/models';
import { RootStoreState, CentreStoreActions, CentreStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map, takeUntil, tap, shareReplay, withLatestFrom } from 'rxjs/operators';
import { Dictionary } from '@ngrx/entity';

@Component({
  selector: 'app-centre-summary',
  templateUrl: './centre-summary.component.html',
  styleUrls: ['./centre-summary.component.scss']
})
export class CentreSummaryComponent implements OnInit, OnDestroy {
  @ViewChild('updateNameModal', { static: false }) updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal', { static: false }) updateDescriptionModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;
  isEnableAllowed$: Observable<boolean>;
  centre$: Observable<CentreUI>;
  centreStateUIMap = CentreStateUIMap;
  descriptionToggleLength = 80;
  getStateIcon = CentreUI.getStateIcon;
  getStateIconClass = CentreUI.getStateIconClass;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;

  private centreId: string;
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
      map(centre => (centre ? new CentreUI(centre) : undefined)),
      shareReplay()
    );

    this.centre$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.centreSubject);
    this.isEnableAllowed$ = this.centre$.pipe(
      map(centre => (centre ? centre.entity.studyNames.length > 0 : false))
    );
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
}
