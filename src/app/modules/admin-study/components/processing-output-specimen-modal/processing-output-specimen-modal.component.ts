import { Component, OnInit, Input } from '@angular/core';
import { ProcessingType, OutputSpecimenProcessing } from '@app/domain/studies';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProcessingTypeOutputSubformComponent } from '../processing-type-output-subform/processing-type-output-subform.component';

@Component({
  selector: 'app-processing-output-specimen-modal',
  templateUrl: './processing-output-specimen-modal.component.html',
  styleUrls: ['./processing-output-specimen-modal.component.scss']
})
export class ProcessingOutputSpecimenModalComponent implements OnInit {

  @Input() processingType: ProcessingType;

  form: FormGroup;

  constructor(public activeModal: NgbActiveModal,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      outputSubForm: ProcessingTypeOutputSubformComponent.buildSubForm(this.processingType),
    });
  }

  get outputSubForm() {
    return this.form.get('outputSubForm');
  }

  onSubmit(): void {
    const output = new OutputSpecimenProcessing().deserialize({
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
      });
    this.activeModal.close(output);
  }

}
