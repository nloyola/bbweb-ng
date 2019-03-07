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
import { filter, map, takeUntil } from 'rxjs/operators';
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
  isEnableAllowed: boolean;
  centreStateUIMap = CentreStateUIMap;
  descriptionToggleLength = 80;
  getStateIcon = CentreUI.getStateIcon;
  getStateIconClass = CentreUI.getStateIconClass;
  updateNameModalOptions: ModalInputTextOptions;
  updateDescriptionModalOptions: ModalInputTextareaOptions;

  private centreId: string;
  private centre: CentreUI;
  private updatedMessage: string;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: NgbModal,
              private router: Router,
              private route: ActivatedRoute,
              private toastr: ToastrService) {}

  ngOnInit() {
    this.isLoading$ = this.store$.pipe(select(SpinnerStoreSelectors.selectSpinnerIsActive));

    this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentres),
      filter(s => s.length > 0),
      map((centres: Centre[]) => centres.find(s => s.slug === this.route.parent.snapshot.params.slug)),
      filter(centre => centre !== undefined),
      map(centre => (centre instanceof Centre) ? centre :  new Centre().deserialize(centre)),
      takeUntil(this.unsubscribe$))
      .subscribe(centre => {
        this.centre = new CentreUI(centre);
        this.centreId = centre.id;
        this.isEnableAllowed = centre.studyNames.length > 0;
      });

    this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentreEntities),
      filter((entities: Dictionary<Centre>) => Object.keys(entities).length > 0),
      takeUntil(this.unsubscribe$))
      .subscribe((entities: any) => {
        if (this.centreId === undefined) { return; }

        const entity = entities[this.centreId];
        const updatedCentre = (entity instanceof Centre) ? entity : new Centre().deserialize(entity);
        this.centre = new CentreUI(updatedCentre);

        // when centre name is changed, the route must be updated because the slug used in the route,
        // and the slug is derived from the name
        if (this.centreId && !location.pathname.endsWith(`/${entity.slug}`)) {
          this.router.navigate([ '../..', entity.slug, 'summary' ], { relativeTo: this.route });
        }

        if (this.updatedMessage) {
          this.toastr.success(this.updatedMessage, 'Update Successfull');
        }
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
        if (value.confirmed) {
          this.store$.dispatch(new CentreStoreActions.UpdateCentreRequest({
            centre: this.centre.entity,
            attributeName: 'name',
            value: value.value
          }));
          this.updatedMessage = 'Centre name was updated';
        }
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
        if (value.confirmed) {
          this.store$.dispatch(new CentreStoreActions.UpdateCentreRequest({
            centre: this.centre.entity,
            attributeName: 'description',
            value: value.value ? value.value : undefined
          }));
          this.updatedMessage = 'Centre description was updated';
        }
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
      centre: this.centre.entity,
      attributeName: 'state',
      value: action
    }));
    this.updatedMessage = 'Centre state was updated';
  }

}
