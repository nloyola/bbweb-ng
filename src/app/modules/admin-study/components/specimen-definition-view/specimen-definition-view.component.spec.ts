import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecimenDefinitionViewComponent } from './specimen-definition-view.component';

describe('SpecimenDefinitionViewComponent', () => {
  let component: SpecimenDefinitionViewComponent;
  let fixture: ComponentFixture<SpecimenDefinitionViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecimenDefinitionViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenDefinitionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
