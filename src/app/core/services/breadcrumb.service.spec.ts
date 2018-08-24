import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BreadcrumbService } from './breadcrumb.service';

describe('BreadcrumbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [BreadcrumbService]
    });
  });

  it('should be created', inject([BreadcrumbService], (service: BreadcrumbService) => {
    expect(service).toBeTruthy();
  }));
});
