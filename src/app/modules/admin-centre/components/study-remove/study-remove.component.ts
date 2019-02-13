import { Component, OnInit, Input } from '@angular/core';
import { ModalInputResult } from '@app/modules/modal-input/models';
import { EntityNameAndState } from '@app/domain';
import { StudyState } from '@app/domain/studies';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-study-remove',
  templateUrl: './study-remove.component.html',
  styleUrls: ['./study-remove.component.scss']
})
export class StudyRemoveComponent implements OnInit {

  @Input() study: EntityNameAndState<StudyState>;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

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
