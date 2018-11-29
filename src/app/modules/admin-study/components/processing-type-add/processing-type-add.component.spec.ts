import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingTypeAddComponent } from './processing-type-add.component';

describe('ProcessingTypeAddComponent', () => {
  let component: ProcessingTypeAddComponent;
  let fixture: ComponentFixture<ProcessingTypeAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingTypeAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
