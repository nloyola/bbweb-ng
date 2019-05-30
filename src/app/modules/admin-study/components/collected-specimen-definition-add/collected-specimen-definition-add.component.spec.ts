import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectedSpecimenDefinition, CollectionEventType } from '@app/domain/studies';
import { AuthStoreReducer } from '@app/root-store/auth-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { Factory } from '@test/factory';
import { StoreModule } from '@ngrx/store';
import { ToastrModule } from 'ngx-toastr';
import { CollectedSpecimenDefinitionAddComponent } from './collected-specimen-definition-add.component';

describe('CollectedSpecimenDefinitionAddComponent', () => {

  let factory: Factory;
  let component: CollectedSpecimenDefinitionAddComponent;
  let fixture: ComponentFixture<CollectedSpecimenDefinitionAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'auth': AuthStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [ CollectedSpecimenDefinitionAddComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    factory = new Factory();

    fixture = TestBed.createComponent(CollectedSpecimenDefinitionAddComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.specimenDefinition = new CollectedSpecimenDefinition();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('test for emitters', () => {
    const eventType = eventTypeForTest();
    const testData = [
      {
        componentFunc: () => component.onSubmit(),
        emitter: component.submitted,
        arg: undefined
      },
      {
        componentFunc: () => component.onCancel(),
        emitter: component.cancelled,
        arg: undefined
      }
    ];

    [
      eventType.specimenDefinitions[0],
      new CollectedSpecimenDefinition()
    ].forEach(specimenDefinition => {
      component.specimenDefinition = specimenDefinition;
      fixture.detectChanges();

      testData.forEach(testInfo => {
        jest.spyOn(testInfo.emitter, 'emit').mockReturnValue(null);
        testInfo.componentFunc();
        expect(testInfo.emitter.emit).toHaveBeenCalled();
      });
    });

  });

  it('specimen definition can be assigned using change detection', () => {
    const eventType = eventTypeForTest();
    component.specimenDefinition = new CollectedSpecimenDefinition();
    fixture.detectChanges();
    expect(component.title).toBe('Add Collected Specimen');

    eventType.specimenDefinitions[0].id = factory.stringNext();

    component.ngOnChanges({
      specimenDefinition: new SimpleChange(null, eventType.specimenDefinitions[0], false)
    });

    expect(component.title).toBe('Update Collected Specimen');
  });

  function eventTypeForTest(): CollectionEventType {
    return new CollectionEventType().deserialize({
      ...factory.collectionEventType({
        specimenDefinitions: [ factory.collectedSpecimenDefinition() ]
      })
    });
  }


});
