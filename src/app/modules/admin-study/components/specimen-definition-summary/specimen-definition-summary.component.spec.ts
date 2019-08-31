import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TruncatePipe } from '@app/shared/pipes';
import { SpecimenDefinitionSummaryComponent } from './specimen-definition-summary.component';
import { Factory } from '@test/factory';
import { CollectedSpecimenDefinition } from '@app/domain/studies';

describe('SpecimenDefinitionSummaryComponent', () => {
  let component: SpecimenDefinitionSummaryComponent;
  let fixture: ComponentFixture<SpecimenDefinitionSummaryComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    factory = new Factory();

    TestBed.configureTestingModule({
      declarations: [SpecimenDefinitionSummaryComponent, TruncatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenDefinitionSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.specimenDefinition = new CollectedSpecimenDefinition().deserialize(
      factory.collectedSpecimenDefinition()
    );
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
