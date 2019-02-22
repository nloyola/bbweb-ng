import { Component, Input } from '@angular/core';
import { EntityNameAndState } from '@app/domain';
import { StudyState } from '@app/domain/studies';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-study-remove',
  templateUrl: './study-remove.component.html',
  styleUrls: ['./study-remove.component.scss']
})
export class StudyRemoveComponent {

  @Input() study: EntityNameAndState<StudyState>;

  constructor(public activeModal: NgbActiveModal) { }f

  close(): (result: any) => void {
    return (source: any): void => {
      const result = {
        confirmed: (source === 'OK'),
        value: this.study
      };
      this.activeModal.close(result);
    };
  }
}
