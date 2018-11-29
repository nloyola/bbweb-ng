import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectedSpecimenDefinitionName, ProcessedSpecimenDefinitionName, ProcessingType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreSelectors, RootStoreState } from '@app/root-store';
import { ProcessingTypeStoreActions, ProcessingTypeStoreSelectors } from '@app/root-store/processing-type';
import { createSelector, select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ProcessingTypeInformationSubformComponent } from '../processing-type-information-subform/processing-type-information-subform.component';
import { ProcessingTypeInputSubformComponent } from '../processing-type-input-subform/processing-type-input-subform.component';
import { ProcessingTypeOutputSubformComponent } from '../processing-type-output-subform/processing-type-output-subform.component';

@Component({
  selector: 'app-processing-type-add',
  templateUrl: './processing-type-add.component.html',
  styleUrls: ['./processing-type-add.component.scss']
})
export class ProcessingTypeAddComponent implements OnInit, OnDestroy {

  @Input() processingType: ProcessingType;

  study: Study;
  form: FormGroup;

  processedDefinitionNames: ProcessedSpecimenDefinitionName[];
  collectedDefinitionNames: CollectedSpecimenDefinitionName[];
  inputEntityName: string;
  inputDefinitionName: string;

  private processingTypeToSave: ProcessingType;
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private toastr: ToastrService) {
  }

  ngOnInit() {
    this.study = this.route.parent.parent.snapshot.data.study;
    if (this.processingType === undefined) {
      this.processingType = new ProcessingType();
    }

    this.form = this.formBuilder.group({
      infoSubForm: ProcessingTypeInformationSubformComponent.buildSubForm(this.processingType),
      inputSubForm: ProcessingTypeInputSubformComponent.buildSubForm(this.processingType),
      outputSubForm: ProcessingTypeOutputSubformComponent.buildSubForm(this.processingType)
    });

    // inform the user when after the processing type was added
    this.store$
      .pipe(select(ProcessingTypeStoreSelectors.selectLastAdded),
            filter(et => !!et),
            takeUntil(this.unsubscribe$))
      .subscribe((processingType: ProcessingType) => {
        this.toastr.success(
          `ProcessingType was added successfully: ${processingType.name}`,
          'Add Successfull');
        this.store$.dispatch(new ProcessingTypeStoreActions.ClearLastAdded());
        this.navigateToReturnUrl();
      });

    this.store$
      .pipe(
        select(ProcessingTypeStoreSelectors.selectError),
        filter(et => !!et),
        takeUntil(this.unsubscribe$))
      .subscribe((error: any) => {
        let errMessage = error.error ? error.error.message : error.statusText;
        if (errMessage.match(/EntityCriteriaError.*name already used/)) {
          errMessage = `The name is already in use: ${this.processingTypeToSave.name}`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
      });

    const entitiesSelector = createSelector(
      ProcessingTypeStoreSelectors.selectSpecimenDefinitionNames,
      EventTypeStoreSelectors.selectSpecimenDefinitionNames,
      (processedDefinitions: ProcessedSpecimenDefinitionName[],
       collectedDefinitions: CollectedSpecimenDefinitionName[]) => {
         const result = {
           processed: processedDefinitions,
           collected: collectedDefinitions
         };
         return result;
       });

    this.store$.pipe(
      select(entitiesSelector),
      takeUntil(this.unsubscribe$))
      .subscribe((definitionNames) => {
        this.processedDefinitionNames = definitionNames.processed;
        this.collectedDefinitionNames = definitionNames.collected;
      });

    this.store$.dispatch(new ProcessingTypeStoreActions.GetSpecimenDefinitionNamesRequest({
      studyId: this.study.id
    }));

    this.store$.dispatch(new EventTypeStoreActions.GetSpecimenDefinitionNamesRequest({
      studySlug: this.study.slug
    }));
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
    this.navigateToReturnUrl();
  }

  stepClick(event) {
    if (event.selectedIndex >= 3) {
      this.processingTypeToSave = this.formToProcessingType();

      const entityId = this.inputSubForm.value.entityId;

      if (this.inputSubForm.value.definitionType === 'collected') {
        const sourceName = this.collectedDefinitionNames.find(cdn => cdn.id === entityId);
        if (sourceName) {
          this.inputEntityName = sourceName.name;

          const definitionId = this.inputSubForm.value.definitionId;
          const sdName =
            sourceName.specimenDefinitionNames.find(sdn => sdn.id === definitionId);
          if (sdName) { this.inputDefinitionName = sdName.name; }
        }
      } else {
        const processedName = this.processedDefinitionNames.find(name => name.id === entityId);
        if (processedName) {
          this.inputDefinitionName = processedName.specimenDefinitionName.name;
        }
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

      const processedName = this.processedDefinitionNames.find(name => name.id === input.entityId);
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
      studyId:         this.study.id,
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

  private navigateToReturnUrl() {
    this.router.navigate([ '..' ], { relativeTo: this.route });
  }

}
