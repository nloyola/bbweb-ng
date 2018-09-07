import { EntityStateInfo } from '@app/domain/entity-state-info.model';
import { SearchFilter } from './search-filter.model';

/**
 * A StateFilter aids in using the search API provided by the Biobank REST API.
 */
export class StateFilter extends SearchFilter {

  private allStates: EntityStateInfo = {
    id: 'all',
    label: 'All'
  };

  /**
   * @param choices - the choices available to choose from.
   *
   * @param defaultSelection - the ID of the state to select by default.
   *
   * @param allAllowed - Set this to TRUE to allow selection of all choices.
   */
  constructor(public choices: EntityStateInfo[],
              public defaultSelection: string,
              public allAllowed: boolean) {
    super(StateFilter.name);
    if (this.allAllowed) {
      this.choices = [this.allStates].concat(this.choices);
    }
    if (defaultSelection) {
      this.value = defaultSelection;
    }
  }

  getValue() {
    if (this.value !== 'all') {
      return 'state::' + this.value;
    }
    return '';
  }

  setValue(value: string) {
    const found = this.choices.find(choice => choice.id === value);
    if (!found) {
      throw new Error('state filter not valid: ' + value);
    }
    this.value = value;
  }

  allChoices() {
    return this.choices;
  }

  clearValue() {
    this.value = 'all';
  }

}
