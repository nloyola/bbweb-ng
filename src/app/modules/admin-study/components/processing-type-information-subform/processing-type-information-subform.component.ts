import { Component, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProcessingType } from '@app/domain/studies';

@Component({
  selector: 'app-processing-type-information-subform',
  templateUrl: './processing-type-information-subform.component.html',
  styleUrls: ['./processing-type-information-subform.component.scss']
})
export class ProcessingTypeInformationSubformComponent {

  @Input() processingType: ProcessingType;
  @Input() subform: FormGroup;

  static buildSubForm(processingType: ProcessingType) {
    return new FormGroup({
      name: new FormControl(processingType.name, [ Validators.required ]),
      description: new FormControl(processingType.description),
      enabled: new FormControl(processingType.enabled)
    });
  }

  constructor() { }

  get name() {
    return this.subform.get('name');
  }

  get description() {
    return this.subform.get('description');
  }
}
