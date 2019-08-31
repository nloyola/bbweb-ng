import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecimenDefinitionActionsComponent } from './specimen-definition-actions.component';

describe('SpecimenDefinitionActionsComponent', () => {
  let component: SpecimenDefinitionActionsComponent;
  let fixture: ComponentFixture<SpecimenDefinitionActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpecimenDefinitionActionsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenDefinitionActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
