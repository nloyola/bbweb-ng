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
    Object.defineProperty(this, 'parent', { get: () => func() });
  }

  spyOnSnapshot(func: () => void): void {
    Object.defineProperty(this, 'snapshot', { get: () => func() });
  }
}
