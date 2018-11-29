import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecimenDefinitionAddComponent } from './specimen-definition-add.component';

describe('SpecimenDefinitionAddComponent', () => {
  let component: SpecimenDefinitionAddComponent;
  let fixture: ComponentFixture<SpecimenDefinitionAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecimenDefinitionAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenDefinitionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
