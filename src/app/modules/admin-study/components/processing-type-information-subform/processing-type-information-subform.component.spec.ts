import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingTypeInformationSubformComponent } from './processing-type-information-subform.component';

describe('ProcessingTypeInformationSubformComponent', () => {
  let component: ProcessingTypeInformationSubformComponent;
  let fixture: ComponentFixture<ProcessingTypeInformationSubformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingTypeInformationSubformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeInformationSubformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
