import { AnnotationType } from '@app/domain/annotations';
import { DomainEntityUI } from '@app/domain/entity-ui.model';
import { StudyStateUIMap } from '@app/domain/studies/study-state-ui-map.model';
import { StudyState } from '@app/domain/studies/study-state.enum';
import { Study } from '@app/domain/studies/study.model';

export class StudyUI implements DomainEntityUI<Study> {

  readonly entity: Study;

  static getStateIcon(state: StudyState): string {
    return StudyStateUIMap.get(state).icon;
  }

  static getStateIconClass(state: StudyState): string {
    return StudyStateUIMap.get(state).iconClass;
  }

  constructor(study: Study) {
    this.entity = study;
  }

  get id() {
    return this.entity.id;
  }

  get slug() {
    return this.entity.slug;
  }

  get name() {
    return this.entity.name;
  }

  get description() {
    return this.entity.description;
  }

  get timeAdded(): Date {
    return this.entity.timeAdded;
  }

  get timeModified(): Date | null {
    return this.entity.timeModified;
  }

  get annotationTypes(): AnnotationType[] {
    return this.entity.annotationTypes;
  }

  stateLabel(): string {
    return StudyStateUIMap.get(this.entity.state).stateLabel;
  }

  stateIcon(): string {
    return StudyStateUIMap.get(this.entity.state).icon;
  }

  stateIconClass(): string {
    return StudyStateUIMap.get(this.entity.state).iconClass;
  }

  isDisabled(): boolean {
    return this.entity.isDisabled();
  }

  isEnabled(): boolean {
    return this.entity.isEnabled();
  }

  isRetired(): boolean {
    return this.entity.isRetired();
  }

}
