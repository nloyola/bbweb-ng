import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockingSpinnerComponent } from './blocking-spinner.component';

describe('BlockingSpinnerComponent', () => {
  let component: BlockingSpinnerComponent;
  let fixture: ComponentFixture<BlockingSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlockingSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
