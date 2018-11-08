import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SpecimenDefinitionRemoveComponent } from './specimen-definition-remove.component';
import { CollectedSpecimenDefinition } from '@app/domain/studies';

describe('SpecimenDefinitionRemoveComponent', () => {
  let component: SpecimenDefinitionRemoveComponent;
  let fixture: ComponentFixture<SpecimenDefinitionRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule.forRoot()
      ],
      providers: [
        NgbActiveModal
      ],
      declarations: [ SpecimenDefinitionRemoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenDefinitionRemoveComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.specimenDefinition = new CollectedSpecimenDefinition();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
