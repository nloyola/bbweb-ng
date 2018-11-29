import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingTypesAddAndSelectComponent } from './processing-types-add-and-select.component';

describe('ProcessingTypesAddAndSelectComponent', () => {
  let component: ProcessingTypesAddAndSelectComponent;
  let fixture: ComponentFixture<ProcessingTypesAddAndSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingTypesAddAndSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypesAddAndSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
