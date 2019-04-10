import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectedSpecimenDefinitionName, ProcessedSpecimenDefinitionName, ProcessingType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState, StudyStoreSelectors } from '@app/root-store';
import { ProcessingTypeStoreActions, ProcessingTypeStoreSelectors } from '@app/root-store/processing-type';
import { createSelector, select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { ProcessingTypeInformationSubformComponent } from '../processing-type-information-subform/processing-type-information-subform.component';
import { ProcessingTypeInputSubformComponent } from '../processing-type-input-subform/processing-type-input-subform.component';
import { ProcessingTypeOutputSubformComponent } from '../processing-type-output-subform/processing-type-output-subform.component';
import { SpecimenDefinitionNamesByStudy } from '@app/root-store/event-type/event-type.reducer';

interface EntityNames {
  processed: ProcessedSpecimenDefinitionName[];
  collected: CollectedSpecimenDefinitionName[];
}

@Component({
  selector: 'app-processing-type-add',
  templateUrl: './processing-type-add.component.html',
  styleUrls: ['./processing-type-add.component.scss']
})
export class ProcessingTypeAddComponent implements OnInit, OnDestroy {

  @Input() processingType: ProcessingType;

  form: FormGroup;
  studyId: string;
  studySlug: string;
  inputEntityName: string;
  inputDefinitionName: string;
  entityNames$: Observable<EntityNames>;

  private processingTypeToSave: ProcessingType;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    if (this.processingType === undefined) {
      this.processingType = new ProcessingType();
    }

    this.form = this.formBuilder.group({
      infoSubForm: ProcessingTypeInformationSubformComponent.buildSubForm(this.processingType),
      inputSubForm: ProcessingTypeInputSubformComponent.buildSubForm(this.processingType),
      outputSubForm: ProcessingTypeOutputSubformComponent.buildSubForm(this.processingType)
    });

    // inform the user after the processing type is added
    this.store$.pipe(
      select(ProcessingTypeStoreSelectors.selectLastAdded),
      filter(et => !!et),
      takeUntil(this.unsubscribe$)
    ).subscribe((processingType: ProcessingType) => {
      this.toastr.success(
        `ProcessingType was added successfully: ${processingType.name}`,
        'Add Successfull');
      this.store$.dispatch(new ProcessingTypeStoreActions.ClearLastAdded());
      this.router.navigate([ '/admin/studies', this.studySlug, 'processing', 'view', processingType.slug ]);
    });

    const entitiesSelector = createSelector(
      ProcessingTypeStoreSelectors.selectSpecimenDefinitionNames,
      EventTypeStoreSelectors.selectSpecimenDefinitionNames,
      (processedDefinitions: ProcessedSpecimenDefinitionName[],
       collectedDefinitions: SpecimenDefinitionNamesByStudy) => {
         const result = {
           processed: processedDefinitions,
           collected: collectedDefinitions[this.route.parent.parent.snapshot.params.slug]
         };
         return result;
       });

    this.entityNames$ = this.store$.pipe(select(entitiesSelector));

    this.store$.pipe(
      select(StudyStoreSelectors.selectAllStudies),
      filter(studies => studies.length > 0),
      map(studies => studies.find(s => s.slug === this.route.parent.parent.snapshot.params.slug)),
      filter(study => study !== undefined),
      map(study => {
        // have to do the following because of this issue:
        //
        // https://github.com/ngrx/platform/issues/976
        return (study instanceof Study) ? study :  new Study().deserialize(study);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe((study: Study) => {
      this.studyId = study.id;
      this.studySlug = study.slug;
      this.store$.dispatch(new ProcessingTypeStoreActions.GetSpecimenDefinitionNamesRequest({
        studyId: study.id
      }));

      this.store$.dispatch(new EventTypeStoreActions.GetSpecimenDefinitionNamesRequest({
        studySlug: study.slug
      }));
    });

    this.store$.pipe(
      select(ProcessingTypeStoreSelectors.selectError),
      filter(et => !!et),
      takeUntil(this.unsubscribe$)
    ).subscribe((error: any) => {
      let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
      if (errMessage && errMessage.match(/EntityCriteriaError.*name already exists/)) {
        /* tslint:disable-next-line:max-line-length */
        errMessage = `A processing step with name ${this.processingTypeToSave.name} already exists. Please use a different one.`;
      }
      this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get infoSubForm() {
    return this.form.get('infoSubForm');
  }

  get inputSubForm() {
    return this.form.get('inputSubForm');
  }

  get outputSubForm() {
    return this.form.get('outputSubForm');
  }

  onSubmit() {
    const processingType = this.formToProcessingType();
    this.store$.dispatch(new ProcessingTypeStoreActions.AddProcessingTypeRequest({
      processingType
    }));
  }

  onCancel() {
    this.router.navigate([ '..' ], { relativeTo: this.route });
  }

  stepClick(event: StepperSelectionEvent) {
    if (event.selectedIndex < 3) { return; }

    this.processingTypeToSave = this.formToProcessingType();

    const entityId = this.inputSubForm.value.entityId;
    let entityNames: EntityNames;
    this.entityNames$.pipe(take(1)).subscribe(en => entityNames = en);

    if (this.inputSubForm.value.definitionType === 'collected') {
      const sourceName = entityNames.collected.find(cdn => cdn.id === entityId);
      if (sourceName) {
        this.inputEntityName = sourceName.name;

        const definitionId = this.inputSubForm.value.definitionId;
        const sdName =
          sourceName.specimenDefinitionNames.find(sdn => sdn.id === definitionId);
        if (sdName) { this.inputDefinitionName = sdName.name; }
      }
    } else {
      const processedName = entityNames.processed.find(name => name.id === entityId);
      if (processedName) {
        this.inputEntityName = processedName.name;
        this.inputDefinitionName = processedName.specimenDefinitionName.name;
      }
    }
  }

  formToProcessingType(): ProcessingType {
    const input = {} as any;
    if (this.inputSubForm.value.definitionType === 'collected') {
      input.entityId = this.inputSubForm.value.entityId;
      input.specimenDefinitionId = this.inputSubForm.value.definitionId;
    } else {
      input.entityId = this.inputSubForm.value.inputProcessingType;

      let entityNames: EntityNames;
      this.entityNames$.pipe(take(1)).subscribe(en => entityNames = en);

      const processedName = entityNames.processed.find(name => name.id === input.entityId);
      if (!processedName) {
        throw new Error('could not find specimen definition id');
      }
      input.specimenDefinitionId = processedName.specimenDefinitionName.id;
    }

    return new ProcessingType().deserialize({
      id:              this.processingType.id,
      name:            this.infoSubForm.value.name,
      description:     this.infoSubForm.value.description,
      enabled:         (this.infoSubForm.value.enabled === true),
      studyId:         this.studyId,
      annotationTypes: [],
      input: {
        ...input,
        definitionType:       this.inputSubForm.value.definitionType,
        expectedChange:       this.inputSubForm.value.expectedChange,
        count:                this.inputSubForm.value.count,
      },
      output: {
        specimenDefinition: {
          name:                    this.outputSubForm.value.spcDefSubForm.name,
          description:             this.outputSubForm.value.spcDefSubForm.description,
          anatomicalSourceType:    this.outputSubForm.value.spcDefSubForm.anatomicalSource,
          preservationType:        this.outputSubForm.value.spcDefSubForm.preservation,
          preservationTemperature: this.outputSubForm.value.spcDefSubForm.temperature,
          specimenType:            this.outputSubForm.value.spcDefSubForm.specimenType,
          units:                   this.outputSubForm.value.spcDefSubForm.units
        },
        expectedChange: this.outputSubForm.value.expectedChange,
        count:          this.outputSubForm.value.count
      }
    });
  }

}
