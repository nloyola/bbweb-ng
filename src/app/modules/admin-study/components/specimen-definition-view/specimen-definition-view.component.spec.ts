import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectedSpecimenDefinition } from '@app/domain/studies';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SpecimenDefinitionViewComponent } from './specimen-definition-view.component';

describe('SpecimenDefinitionViewComponent', () => {
  let component: SpecimenDefinitionViewComponent;
  let fixture: ComponentFixture<SpecimenDefinitionViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      providers: [NgbActiveModal],
      declarations: [SpecimenDefinitionViewComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenDefinitionViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.specimenDefinition = new CollectedSpecimenDefinition();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
