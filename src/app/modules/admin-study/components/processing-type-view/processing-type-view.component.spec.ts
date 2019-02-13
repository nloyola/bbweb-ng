import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessingType } from '@app/domain/studies';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { Factory } from '@test/factory';
import { ProcessingTypeFixture } from '@test/fixtures';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProcessingTypeViewComponent } from './processing-type-view.component';

describe('ProcessingTypeViewComponent', () => {
  let component: ProcessingTypeViewComponent;
  let fixture: ComponentFixture<ProcessingTypeViewComponent>;
  const factory = new Factory();
  const entityFixture = new ProcessingTypeFixture(factory);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule
      ],
      declarations: [
        ProcessingTypeViewComponent,
        YesNoPipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeViewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('changes are handled', () => {
    const entities = entityFixture.createEntities();
    component.processingType = entities.processingType;
    fixture.detectChanges();
    expect(component.processingType).toBeDefined();

    const inUseProcessingType = new ProcessingType().deserialize({
      ...entities.processingType,
      inUse: true
    });

    component.ngOnChanges({
      processingType: new SimpleChange(entities.processingType, inUseProcessingType, false)
    });

    expect(component.processingType).toBe(inUseProcessingType);
  });

  describe('for event emitters', () => {

    const compUpdateFuncNames = [
      'updateName',
      'updateDescription',
      'updateEnabled',
      'addAnnotationType',
      'viewAnnotationType',
      'editAnnotationType',
      'removeAnnotationType',
      'inputSpecimenUpdate',
      'outputSpecimenUpdate',
      'removeProcessingType'
    ];

    it('produces the event', () => {
      const entities = entityFixture.createEntities();
      component.processingType = entities.processingType;
      fixture.detectChanges();
      compUpdateFuncNames.forEach(compUpdateFuncName => {
        let eventProduced = false;
        const emitterName = `${compUpdateFuncName}Selected`;
        component[emitterName].subscribe(() => { eventProduced = true; });
        component[compUpdateFuncName]();
        expect(eventProduced).toBe(true);
      });
    });

  });

});
