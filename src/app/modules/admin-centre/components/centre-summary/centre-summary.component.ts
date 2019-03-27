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
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap, shareReplay, withLatestFrom } from 'rxjs/operators';
import { Dictionary } from '@ngrx/entity';

@Component({
  selector: 'app-centre-summary',
  templateUrl: './centre-summary.component.html',
  styleUrls: ['./centre-summary.component.scss']
})
export class CentreSummaryComponent implements OnInit, OnDestroy {

  @ViewChild('updateNameModal') updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal') updateDescriptionModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;
  centre$: Observable<CentreUI>;
  centreEntity: Centre;
  isEnableAllowed: boolean;
  centreStateUIMap = CentreStateUIMap;
  descriptionToggleLength = 80;
  getStateIcon = CentreUI.getStateIcon;
  getStateIconClass = CentreUI.getStateIconClass;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;

  private centreId: string;
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: NgbModal,
              private router: Router,
              private route: ActivatedRoute,
              private toastr: ToastrService) {}

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.centre$ = this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentres),
      filter(s => s.length > 0),
      map((centres: Centre[]) => {
        const centreEntity = centres.find(s => s.slug === this.route.parent.snapshot.params.slug);
        if (centreEntity) {
          return (centreEntity instanceof Centre) ? centreEntity :  new Centre().deserialize(centreEntity);
        }

        if (this.centreId) {
          const centreById = centres.find(u => u.id === this.centreId);
          if (centreById) {
            return (centreById instanceof Centre) ? centreById : new Centre().deserialize(centreById);
          }
        }
        return undefined;
      }),
      tap(centre => {
        if (centre) {
          this.centreEntity = centre;
          this.centreId = centre.id;
          this.isEnableAllowed = centre.studyNames.length > 0;
        }
      }),
      map(centre => centre ? new CentreUI(centre) : undefined),
      shareReplay());

    this.centre$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ centre, msg ]) => {
      if (centre !== undefined) {
        this.toastr.success(msg, 'Update Successfull');

        if (centre.slug !== this.route.parent.snapshot.params.slug) {
          // name was changed and new slug was assigned
          //
          // need to change state since slug is used in URL and by breadcrumbs
          this.router.navigate([ '../..', centre.slug, 'summary' ], { relativeTo: this.route });
        }
      }
    });

    this.store$.pipe(
      select(CentreStoreSelectors.selectCentreError),
      filter(error => !!error),
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ error, _msg ]) => {
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
    this.updateNameModalOptions = {
      required: true,
      minLength: 2
    };
    this.modalService.open(this.updateNameModal).result
      .then(value => {
        this.store$.dispatch(new CentreStoreActions.UpdateCentreRequest({
          centre: this.centreEntity,
          attributeName: 'name',
          value
        }));
        this.updatedMessage$.next('Centre name was updated');
      })
      .catch(err => console.log('err', err));
  }

  updateDescription() {
    this.updateDescriptionModalOptions = {
      rows: 20,
      cols: 10
    };
    this.modalService.open(this.updateDescriptionModal, { size: 'lg' }).result
      .then(value => {
        this.store$.dispatch(new CentreStoreActions.UpdateCentreRequest({
          centre: this.centreEntity,
          attributeName: 'description',
          value: value ? value : undefined
        }));
        this.updatedMessage$.next('Centre description was updated');
      })
      .catch(err => console.log('err', err));
  }

  disable() {
    this.changeState('disable');
  }

  enable() {
    this.changeState('enable');
  }

  retire() {
    this.changeState('retire');
  }

  unretire() {
    this.changeState('unretire');
  }

  private changeState(action: string) {
    this.store$.dispatch(new CentreStoreActions.UpdateCentreRequest({
      centre: this.centreEntity,
      attributeName: 'state',
      value: action
    }));
    this.updatedMessage$.next('Centre state was updated');
  }

}
