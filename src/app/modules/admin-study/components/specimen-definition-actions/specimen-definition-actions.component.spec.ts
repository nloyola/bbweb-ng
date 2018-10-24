import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecimenDefinitionActionsComponent } from './specimen-definition-actions.component';

describe('SpecimenDefinitionActionsComponent', () => {
  let component: SpecimenDefinitionActionsComponent;
  let fixture: ComponentFixture<SpecimenDefinitionActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecimenDefinitionActionsComponent ]
    })
    .compileComponents();
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
