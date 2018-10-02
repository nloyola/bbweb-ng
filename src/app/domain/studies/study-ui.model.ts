import { EntityUI, DomainEntityUI } from "@app/domain/entity-ui.model";
import { Study } from "@app/domain/studies/study.model";
import { StudyState } from "@app/domain/studies/study-state.enum";
import { StudyStateUIMap } from "@app/domain/studies/study-state-ui-map.model";

export class StudyUI implements DomainEntityUI<Study> {

  readonly entity: Study;

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

  stateLabel(): string {
    return StudyStateUIMap.get(this.entity.state).stateLabel;
  }

  icon(): string {
    return StudyStateUIMap.get(this.entity.state).icon;
  }

  iconClass(): string {
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

  public static getStateIcon(state: StudyState): string {
    return StudyStateUIMap.get(state).icon;
  }

  public static getStateIconClass(state: StudyState): string {
    return StudyStateUIMap.get(state).iconClass;
  }

}
