import { of as observableOf } from 'rxjs';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

export class MockActivatedRoute extends ActivatedRoute {

  constructor(parameters?: { [key: string]: any; }) {
    super();
    this.params = observableOf(parameters);
  }

  get parent(): ActivatedRoute { return null; }
  get snapshot(): ActivatedRouteSnapshot { return null; }

  spyOnParent(func: () => void): void {
    jest.spyOn(this, 'parent', 'get').mockImplementation(func);
  }

  spyOnSnapshot(func: () => void): void {
    jest.spyOn(this, 'snapshot', 'get').mockImplementation(func);
  }
}
