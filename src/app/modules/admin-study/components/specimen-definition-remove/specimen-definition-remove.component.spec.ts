import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecimenDefinitionRemoveComponent } from './specimen-definition-remove.component';

describe('SpecimenDefinitionRemoveComponent', () => {
  let component: SpecimenDefinitionRemoveComponent;
  let fixture: ComponentFixture<SpecimenDefinitionRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecimenDefinitionRemoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenDefinitionRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
