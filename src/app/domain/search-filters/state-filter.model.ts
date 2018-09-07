import { EntityStateInfo } from "@app/domain/entity-state-info.model";
import { SearchFilter } from "./search-filter.model";

/**
 * StateFilter's aid in using the search API provided by the Biobank REST API.
 */
export class StateFilter extends SearchFilter {

  private allStates: EntityStateInfo = {
    id: 'all',
    label: 'All'
  }

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
      this.setValue(defaultSelection);
    }
  }

  setValue(value) {
    var found = this.choices.find(choice => choice.id === value);
    if (!found) {
      throw new Error('state filter not valid: ' + value);
    }
    SearchFilter.prototype.setValue.call(this, value);
  }

  getValue() {
    if (this.value !== 'all') {
      return 'state::' + this.value;
    }
    return '';
  }

  allChoices() {
    return this.choices;
  }

  clearValue() {
    this.setValue('all');
  }

}
