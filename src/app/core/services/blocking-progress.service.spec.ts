import { TestBed, inject } from '@angular/core/testing';

import { BlockingProgressService } from './blocking-progress.service';

describe('BlockingProgressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BlockingProgressService]
    });
  });

  it('should be created', inject([BlockingProgressService], (service: BlockingProgressService) => {
    expect(service).toBeTruthy();
  }));
});
