import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AnnotationType } from '@app/domain/annotations';
import { CollectionEventType, ProcessingType, ProcessingTypeInputEntity, Study } from '@app/domain/studies';
import { ModalInputTextareaOptions, ModalInputTextOptions } from '@app/modules/modals/models';
import { EventTypeStoreActions, EventTypeStoreSelectors, ProcessingTypeStoreActions, ProcessingTypeStoreSelectors, RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from '@ngrx/entity';
import { Action, createSelector, select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { ProcessingInputSpecimenModalComponent } from '../processing-input-specimen-modal/processing-input-specimen-modal.component';
import { ProcessingOutputSpecimenModalComponent } from '../processing-output-specimen-modal/processing-output-specimen-modal.component';
import { ProcessingTypeRemoveComponent } from '../processing-type-remove/processing-type-remove.component';

interface StoreData {
  study: Study;
  processingType: ProcessingType;
  allowChanges: boolean;
}

interface Entities {
  studies: Study[];
  processingTypes: ProcessingType[];
  eventTypes: Dictionary<CollectionEventType>;
}

@Component({
  selector: 'app-processing-type-view',
  templateUrl: './processing-type-view.container.html'
})
export class ProcessingTypeViewContainerComponent implements OnInit, OnDestroy {

  @ViewChild('updateNameModal') updateNameModal: TemplateRef<any>;
  @ViewChild('updateDescriptionModal') updateDescriptionModal: TemplateRef<any>;
  @ViewChild('updateEnabledModal') updateEnabledModal: TemplateRef<any>;
  @ViewChild('processingTypeInUseModal') processingTypeInUseModal: TemplateRef<any>;

  isLoading$: Observable<boolean>;

  processingType$: Observable<ProcessingType>;
  allowChanges$: Observable<boolean>;
  processingTypeId: string;
  processingType: ProcessingType;
  processingTypes: ProcessingType[];
  eventTypes: Dictionary<CollectionEventType>;
  study: Study;
  allowChanges: boolean;
  isAddingAnnotation = false;
  updateNameModalOptions: ModalInputTextOptions = {
    required: true,
    minLength: 2
  };
  updateDescriptionModalOptions: ModalInputTextareaOptions = {
    rows: 20,
    cols: 10
  };
  inputEntity: ProcessingTypeInputEntity;

  private data$: Observable<StoreData>;
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) {}

  ngOnInit() {
    this.route.params.pipe(
      map(params => params.processingTypeSlug),
      takeUntil(this.unsubscribe$)
    ).subscribe(slug => {
      if (this.processingTypes === undefined) { return; }

      this.processingType = this.getProcessingType(slug, this.processingTypes);

      if (this.processingType) {
        this.inputEntity = this.queryForInputEntity(this.processingType,
                                                    this.eventTypes,
                                                    this.processingTypes);
      } else {
        this.store$.dispatch(new ProcessingTypeStoreActions.GetProcessingTypeRequest({
          studySlug: this.route.parent.parent.parent.parent.snapshot.params.slug,
          processingTypeSlug: this.route.snapshot.params.processingTypeSlug
        }));
      }

      this.updatedMessage$.next(null);
    });

    const entitiesSelector = createSelector(
      StudyStoreSelectors.selectAllStudies,
      ProcessingTypeStoreSelectors.selectAllProcessingTypes,
      EventTypeStoreSelectors.selectAllEventTypeEntities,
      (studies: Study[],
       processingTypes: ProcessingType[],
       eventTypes: Dictionary<CollectionEventType>): Entities => ({
         studies,
         processingTypes,
         eventTypes
       }));

    this.data$ = this.store$.pipe(
      select(entitiesSelector),
      map((entities) => {
        let study: Study;

        const studyEntity = entities.studies
          .find(s => s.slug === this.route.parent.parent.parent.parent.snapshot.params.slug);
        if (studyEntity) {
          study = (studyEntity instanceof Study) ? studyEntity :  new Study().deserialize(studyEntity);
        }

        let processingType = this.getProcessingType(this.route.parent.snapshot.params.processingTypeSlug,
                                                      entities.processingTypes);

        if (processingType) {
          this.processingTypeId = processingType.id;
          this.inputEntity = this.queryForInputEntity(processingType,
                                                      entities.eventTypes,
                                                      entities.processingTypes);
        } else if (this.processingTypeId) {
          const ptEntityById = entities.processingTypes.find(pt => pt.id === this.processingType.id);

          if (ptEntityById) {
            processingType = (ptEntityById instanceof ProcessingType)
              ? ptEntityById : new ProcessingType().deserialize(ptEntityById);
          }
        }

        return {
          study,
          processingType,
          processingTypes: entities.processingTypes,
          eventTypes: entities.eventTypes,
          allowChanges: study ? study.isDisabled() : undefined
        };
      }),
      tap(data => {
        this.study = data.study;
        this.processingType = data.processingType;
        this.processingTypes = data.processingTypes;
        this.eventTypes = data.eventTypes;
        this.allowChanges = data.allowChanges;
      }),
      takeUntil(this.unsubscribe$),
      shareReplay());

    this.allowChanges$ = this.data$.pipe(map(data => data.allowChanges));
    this.isLoading$ = this.data$.pipe(map(data => data !== undefined));

    this.data$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ data, msg ]) => {
      if (msg === null) { return; }

      this.toastr.success(msg, 'Update Successfull');

      if (data.processingType !== undefined) {
        if (data.processingType.slug !== this.route.parent.snapshot.params.processingTypeSlug) {
          // name was changed and new slug was assigned
          //
          // need to change state since slug is used in URL and by breadcrumbs
          this.router.navigate([
            '/admin/studies',
            data.study.slug,
            'processing',
            'view',
            data.processingType.slug
          ]);
        }
      } else {
        this.router.navigate([ '/admin/studies', data.study.slug, 'processing' ]);
        this.processingType = undefined;
        this.processingTypeId = undefined;
      }
    });

    this.store$.pipe(
      select(ProcessingTypeStoreSelectors.selectError),
      filter(error => !!error),
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([error, _msg]) => {
      let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
      if (errMessage.indexOf('already exists') > -1) {
        errMessage = 'A processing step with that name already exists. Please use another name.';
      }
      this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateName() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }
    this.modalService.open(this.updateNameModal, { size: 'lg' }).result
      .then((value) => {
        this.store$.dispatch(new ProcessingTypeStoreActions.UpdateProcessingTypeRequest({
          processingType: this.processingType,
          attributeName: 'name',
          value
        }));
        this.updatedMessage$.next('Step name was updated');
      })
      .catch(() => undefined);
  }

  updateDescription() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    this.modalService.open(this.updateDescriptionModal, { size: 'lg' }).result
      .then((value) => {
        this.store$.dispatch(new ProcessingTypeStoreActions.UpdateProcessingTypeRequest({
          processingType: this.processingType,
          attributeName: 'description',
          value: value ? value : undefined
        }));
        this.updatedMessage$.next('Step description was updated');
      })
      .catch(() => undefined);
  }

  updateEnabled() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    this.modalService.open(this.updateEnabledModal, { size: 'lg' }).result
      .then(value => {
        this.store$.dispatch(new ProcessingTypeStoreActions.UpdateProcessingTypeRequest({
          processingType: this.processingType,
          attributeName: 'enabled',
          value
        }));
        this.updatedMessage$.next('Enabled was updated');
      })
      .catch(() => undefined);
  }

  addAnnotationType() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ 'annotationAdd' ], { relativeTo: this.route });
  }

  viewAnnotationType(annotationType: AnnotationType): void {
    const modalRef = this.modalService.open(AnnotationTypeViewComponent, { size: 'lg' });
    modalRef.componentInstance.annotationType = annotationType;

    // nothing is done with this modal's result
    modalRef.result
      .then(() => undefined)
      .catch(() => undefined);
  }

  editAnnotationType(annotationType: AnnotationType): void {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ 'annotation', annotationType.id ], { relativeTo: this.route });
  }

  removeAnnotationType(annotationType: AnnotationType): void {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    const modalRef = this.modalService.open(AnnotationTypeRemoveComponent);
    modalRef.componentInstance.annotationType = annotationType;
    modalRef.result
      .then(() => {
        this.store$.dispatch(
          new ProcessingTypeStoreActions.UpdateProcessingTypeRemoveAnnotationTypeRequest({
            processingType: this.processingType,
            annotationTypeId: annotationType.id
          }));

        this.updatedMessage$.next('Annotation removed');
      })
      .catch(() => undefined);
  }

  updateInputSpecimen() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }
    const modalRef = this.modalService.open(ProcessingInputSpecimenModalComponent,
                                            { size: 'lg' });
    modalRef.componentInstance.study = this.study;
    modalRef.componentInstance.processingType = this.processingType;
    modalRef.result
      .then(input => {
        if (input === 'Cancel') { return; }

        this.store$.dispatch(new ProcessingTypeStoreActions.UpdateProcessingTypeRequest({
          processingType: this.processingType,
          attributeName: 'inputSpecimenProcessing',
          value: input
        }));

        this.updatedMessage$.next('Input specimen updated');
      })
      .catch(() => undefined);
  }

  updateOutputSpecimen() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    const modalRef = this.modalService.open(ProcessingOutputSpecimenModalComponent,
                                            { size: 'lg' });
    modalRef.componentInstance.study = this.study;
    modalRef.componentInstance.processingType = this.processingType;
    modalRef.componentInstance.eventTypes = this.eventTypes;
    modalRef.componentInstance.processingTypes = this.processingTypes;
    modalRef.result
      .then(output => {
        if (output === 'Cancel') { return; }

        this.store$.dispatch(new ProcessingTypeStoreActions.UpdateProcessingTypeRequest({
          processingType: this.processingType,
          attributeName: 'outputSpecimenProcessing',
          value: output
        }));

        this.updatedMessage$.next('Output specimen updated');
      })
      .catch(() => undefined);
  }

  removeProcessingType() {
    if (!this.allowChanges) {
      throw new Error('modifications not allowed');
    }

    if (this.processingType.inUse) {
      this.modalService.open(this.processingTypeInUseModal, { size: 'lg' });
      return;
    }

    const modalRef = this.modalService.open(ProcessingTypeRemoveComponent, { size: 'lg' });
    modalRef.componentInstance.processingType = this.processingType;
    modalRef.result
      .then(() => {
        this.store$.dispatch(new ProcessingTypeStoreActions.RemoveProcessingTypeRequest({
          processingType: this.processingType
        }));
        this.updatedMessage$.next('Processing step removed');
      })
      .catch(() => undefined);
  }

  addProcessingTypeSelected() {
    if (!this.study.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    // relative route does not work here, why?
    this.router.navigate([ `/admin/studies/${this.study.slug}/processing/add` ]);
  }

  processingTypeSelected(processingType: ProcessingType) {
    this.processingType = processingType;
    // relative route does not work here, why?
    this.router.navigate([ `/admin/studies/${this.study.slug}/processing/${processingType.slug}` ]);
  }

  private queryForInputEntity(
    processingType: ProcessingType,
    eventTypes: Dictionary<CollectionEventType>,
    processingTypes: ProcessingType[]
  ): ProcessingTypeInputEntity {
    const inputEntity =
      (processingType.input.definitionType === 'collected')
      ? eventTypes[processingType.input.entityId]
      : processingTypes.find(pt => pt.id === processingType.input.entityId);

    if (inputEntity) { return inputEntity; }

    let action: Action;
    // then entity has not been retrieved from the server yet
    if (processingType.input.definitionType === 'collected') {
      action = EventTypeStoreActions.getEventTypeByIdRequest({
        studyId: processingType.studyId,
        eventTypeId: processingType.input.entityId
      });
    } else {
      action = new ProcessingTypeStoreActions.GetProcessingTypeByIdRequest({
        studyId: processingType.studyId,
        processingTypeId: processingType.input.entityId
      });
    }
    this.store$.dispatch(action);
    return undefined;
  }

  private getProcessingType(slug: string, processingTypes: ProcessingType[]): ProcessingType {
    const ptEntity = Object.values(processingTypes).find((pt: ProcessingType) => pt.slug === slug);
    if (ptEntity) {
      return (ptEntity instanceof ProcessingType)
        ? ptEntity : new ProcessingType().deserialize(ptEntity);
    }
    return undefined;
  }

}
