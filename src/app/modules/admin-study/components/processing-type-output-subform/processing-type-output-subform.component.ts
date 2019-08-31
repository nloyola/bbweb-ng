import { Component, Input } from '@angular/core';
import { ProcessingType } from '@app/domain/studies';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { SpecimenDefinitionAddComponent } from '../specimen-definition-add/specimen-definition-add.component';
import { CustomValidators } from '@app/shared/validators';

@Component({
  selector: 'app-processing-type-output-subform',
  templateUrl: './processing-type-output-subform.component.html',
  styleUrls: ['./processing-type-output-subform.component.scss']
})
export class ProcessingTypeOutputSubformComponent {
  @Input() processingType: ProcessingType;
  @Input() subform: FormGroup;

  static buildSubForm(processingType: ProcessingType) {
    const output = processingType.output;
    return new FormGroup({
      spcDefSubForm: SpecimenDefinitionAddComponent.buildSubForm(output.specimenDefinition),
      expectedChange: new FormControl(output.expectedChange, [
        Validators.required,
        CustomValidators.floatNumber({ greaterThan: 0 })
      ]),
      count: new FormControl(output.count, [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^[0-9]*$/)
      ])
    });
  }

  constructor() {}

  get spcDefSubForm(): AbstractControl {
    return this.subform.get('spcDefSubForm');
  }

  get units() {
    return this.subform.get('spcDefSubForm').get('units');
  }

  get expectedChange(): AbstractControl {
    return this.subform.get('expectedChange');
  }

  get count(): AbstractControl {
    return this.subform.get('count');
  }
}
