import { EntityUI } from "@app/domain/entity-ui.model";
import { Study } from "@app/domain/studies/study.model";
import { StudyState } from "@app/domain/studies/study-state.enum";
import { StudyStateUIMap } from "@app/domain/studies/study-state-ui-map.model";

export class StudyUI implements EntityUI<Study> {

  readonly stateLabel?: string;
  readonly icon?: string;
  readonly iconClass?: string;

  constructor(public study: Study) {
    Object.assign(this, { entity: study },  StudyStateUIMap.get(study.state));
  }

}
