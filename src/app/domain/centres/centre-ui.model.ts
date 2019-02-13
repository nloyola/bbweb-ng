import { DomainEntityUI } from '@app/domain/entity-ui.model';
import { CentreStateUIMap } from '@app/domain/centres/centre-state-ui-map.model';
import { CentreState } from '@app/domain/centres/centre-state.enum';
import { Centre } from '@app/domain/centres/centre.model';

export class CentreUI implements DomainEntityUI<Centre> {

  readonly entity: Centre;

  public static getStateIcon(state: CentreState): string {
    return CentreStateUIMap.get(state).icon;
  }

  public static getStateIconClass(state: CentreState): string {
    return CentreStateUIMap.get(state).iconClass;
  }

  constructor(centre: Centre) {
    this.entity = centre;
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
    return CentreStateUIMap.get(this.entity.state).stateLabel;
  }

  stateIcon(): string {
    return CentreStateUIMap.get(this.entity.state).icon;
  }

  stateIconClass(): string {
    return CentreStateUIMap.get(this.entity.state).iconClass;
  }

  isDisabled(): boolean {
    return this.entity.isDisabled();
  }

  isEnabled(): boolean {
    return this.entity.isEnabled();
  }

}
