import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockingProgressComponent } from './blocking-progress.component';

describe('BlockingProgressComponent', () => {
  let component: BlockingProgressComponent;
  let fixture: ComponentFixture<BlockingProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockingProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockingProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
