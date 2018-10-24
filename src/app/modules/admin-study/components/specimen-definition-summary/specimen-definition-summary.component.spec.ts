import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecimenDefinitionSummaryComponent } from './specimen-definition-summary.component';

describe('SpecimenDefinitionSummaryComponent', () => {
  let component: SpecimenDefinitionSummaryComponent;
  let fixture: ComponentFixture<SpecimenDefinitionSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecimenDefinitionSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenDefinitionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
