import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  CollectedSpecimenDefinitionName,
  InputSpecimenProcessing,
  ProcessedSpecimenDefinitionName,
  ProcessingType,
  ProcessingTypeInputEntity,
  Study
} from '@app/domain/studies';
import {
  EventTypeStoreActions,
  EventTypeStoreSelectors,
  ProcessingTypeStoreActions,
  ProcessingTypeStoreSelectors,
  RootStoreState
} from '@app/root-store';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { createSelector, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ProcessingTypeInputSubformComponent } from '../processing-type-input-subform/processing-type-input-subform.component';
import { take } from 'rxjs/operators';
import { SpecimenDefinitionNamesByStudy } from '@app/root-store/event-type/event-type.reducer';

interface EntityNames {
  processed: ProcessedSpecimenDefinitionName[];
  collected: CollectedSpecimenDefinitionName[];
}

@Component({
  selector: 'app-processing-input-specimen-modal',
  templateUrl: './processing-input-specimen-modal.component.html',
  styleUrls: ['./processing-input-specimen-modal.component.scss']
})
export class ProcessingInputSpecimenModalComponent implements OnInit {
  @Input() study: Study;
  @Input() processingType: ProcessingType;

  form: FormGroup;
  inputEntity: ProcessingTypeInputEntity;
  entityNames$: Observable<EntityNames>;

  constructor(
    public activeModal: NgbActiveModal,
    private store$: Store<RootStoreState.State>,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      inputSubForm: ProcessingTypeInputSubformComponent.buildSubForm(this.processingType)
    });

    const entitiesSelector = createSelector(
      ProcessingTypeStoreSelectors.selectSpecimenDefinitionNames,
      EventTypeStoreSelectors.selectSpecimenDefinitionNames,
      (pd: ProcessedSpecimenDefinitionName[], cd: SpecimenDefinitionNamesByStudy) => {
        const result = {
          processed: pd,
          collected: cd[this.study.slug]
        };
        return result;
      }
    );

    this.entityNames$ = this.store$.pipe(select(entitiesSelector));

    this.store$.dispatch(
      new ProcessingTypeStoreActions.GetSpecimenDefinitionNamesRequest({
        studyId: this.study.id
      })
    );

    this.store$.dispatch(
      EventTypeStoreActions.getSpecimenDefinitionNamesRequest({
        studySlug: this.study.slug
      })
    );
  }

  get inputSubForm() {
    return this.form.get('inputSubForm');
  }

  onSubmit(): void {
    const input = new InputSpecimenProcessing().deserialize({
      entityId: undefined,
      definitionType: this.inputSubForm.value.definitionType,
      expectedChange: this.inputSubForm.value.expectedChange,
      count: this.inputSubForm.value.count,
      specimenDefinitionId: this.inputSubForm.value.definitionId,
      containerTypeId: null
    });

    if (this.inputSubForm.value.definitionType === 'collected') {
      input.entityId = this.inputSubForm.value.entityId;
    } else {
      let names: EntityNames;
      this.entityNames$.pipe(take(1)).subscribe(en => (names = en));
      const ptName = names.processed.find(n => n.id === this.inputSubForm.value.inputProcessingType);
      if (!ptName) {
        throw new Error('could not find specimen definition id');
      }
      input.entityId = ptName.id;
      input.specimenDefinitionId = ptName.specimenDefinitionName.id;
    }
    this.activeModal.close(input);
  }
}
