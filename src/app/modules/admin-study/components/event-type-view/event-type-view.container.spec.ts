import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study, StudyState, CollectionEventType } from '@app/domain/studies';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { Factory } from '@app/test/factory';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule, Store } from '@ngrx/store';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { EventTypeViewContainer } from './event-type-view.container';
import { StudyStoreReducer, EventTypeStoreReducer, StudyStoreActions, EventTypeStoreActions } from '@app/root-store';
import { ModalInputResult } from '@app/modules/modal-input/models';
import * as faker from 'faker';

describe('EventTypeViewContainer', () => {
  let component: EventTypeViewContainer;
  let fixture: ComponentFixture<EventTypeViewContainer>;
  let factory: Factory;
  let study: Study;
  let store: Store<StudyStoreReducer.State>;

  beforeEach(async(() => {
    factory = new Factory();
    study = new Study().deserialize({
      ...factory.study(),
      state: StudyState.Disabled
    });

    TestBed.configureTestingModule({
      imports: [
        NgbModule.forRoot(),
        RouterTestingModule,
        StoreModule.forRoot({
          'spinner': SpinnerStoreReducer.reducer,
          'study': StudyStoreReducer.reducer,
          'event-type': EventTypeStoreReducer.reducer,
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              parent: {
                snapshot: {
                  data: {
                    study
                  }
                }
              }
            },
            snapshot: {}
          }
        }
      ],
      declarations: [
        EventTypeViewContainer,
        YesNoPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(EventTypeViewContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('allow changes is updated', () => {
    const stateValues = [
      { state: StudyState.Enabled, expectedAllowChanges: false },
      { state: StudyState.Disabled, expectedAllowChanges: true },
    ];

    // put study in store
    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));

    stateValues.forEach(stateValue => {
      const updatedStudy = new Study().deserialize({
        ...study,
        state: stateValue.state
      });
      store.dispatch(new StudyStoreActions.UpdateStudySuccess({ study: updatedStudy }));

      fixture.detectChanges();
      expect(component.allowChanges).toBe(stateValue.expectedAllowChanges);
    });
  });

  it('assigns the event type when it is selected', () => {
    const eventType = new CollectionEventType().deserialize(factory.collectionEventType());
    store.dispatch(new EventTypeStoreActions.GetEventTypeSuccess({ eventType }));
    store.dispatch(new EventTypeStoreActions.EventTypeSelected({ id: eventType.id }));

    fixture.detectChanges();
    expect(component.eventType).toEqual(eventType);
  });

  it('updates to event types are received', () => {
    const eventType = componentSetup(fixture, store, factory);
    const recurringValues = [ !eventType.recurring, eventType.recurring ];

    recurringValues.forEach(recurringValue => {
      const updatedEventType = new CollectionEventType().deserialize(factory.collectionEventType({
        ...eventType,
        recurring: recurringValue
      }))

      store.dispatch(new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType: updatedEventType }));

      fixture.detectChanges();
      expect(component.eventType).toEqual(updatedEventType);
    });
  });

  describe('common behaviour', () => {

    const componentUpdateFuncs = [
      (component, eventType) => component.updateName(),
      (component, eventType) => component.updateDescription(),
      (component, eventType) => component.updateRecurring(),
      (component, eventType) => component.removeAnnotationType(eventType.annotationTypes[0]),
      (component, eventType) => component.removeSpecimenDefinition(eventType.specimenDefinitions[0]),
      (component, eventType) => component.removeEventType()
    ];

    it('functions should open a modal', () => {
      const eventType = componentSetup(fixture, store, factory);
      const modalService = TestBed.get(NgbModal);
      spyOn(modalService, 'open').and.returnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      });

      const componentModalFuncs = componentUpdateFuncs.concat([
        (component, eventType) => component.viewAnnotationType(eventType.annotationTypes[0]),
        (component, eventType) => component.viewSpecimenDefinition(eventType.specimenDefinitions[0])
      ]);

      componentModalFuncs.forEach(modalFunc => modalFunc(component, eventType));
      expect(modalService.open.calls.count()).toBe(componentModalFuncs.length);
    });

    it('functions should throw an error when study is not disabled', () => {
      const updatedStudy = new Study().deserialize({
        ...study,
        state: StudyState.Enabled
      });
      store.dispatch(new StudyStoreActions.GetStudySuccess({ study: updatedStudy }));
      const eventType = componentSetup(fixture, store, factory);

      const throwErrFuncs = componentUpdateFuncs.concat([
        (component, eventType) => component.addAnnotationType(eventType.annotationTypes[0]),
        (component, eventType) => component.editAnnotationType(eventType.annotationTypes[0]),
        (component, eventType) => component.addSpecimenDefinition(eventType.specimenDefinitions[0]),
        (component, eventType) => component.editSpecimenDefinition(eventType.specimenDefinitions[0])
      ]);

      throwErrFuncs.forEach(modalFunc => {
        expect(() => modalFunc(component, eventType)).toThrowError('modifications not allowed');
      });
    });

    it('functions that should notify the user', async(() => {
      const eventType = componentSetup(fixture, store, factory);
      const toastr = TestBed.get(ToastrService);
      const modalService = TestBed.get(NgbModal);
      const modalSpy = spyOn(modalService, 'open');

      spyOn(toastr, 'success').and.returnValue(null);

      componentUpdateFuncs.forEach(updateFunc => {
        modalSpy.and.returnValue({
          componentInstance: {},
          result: Promise.resolve({ confirmed: true, value: 'test' })
        });

        updateFunc(component, eventType);
        fixture.whenStable().then(() => {
          store.dispatch(new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType }));
        });
      });

      fixture.whenStable().then(() => {
        expect(toastr.success.calls.count()).toBe(componentUpdateFuncs.length);
      });
    }));

  });

  describe('when updating name, description and recurring', () => {

    it('dispatches an action to update the event type', async(() => {
      const eventType = componentSetup(fixture, store, factory);

      const testData = [
        {
          updateFunc: () => component.updateName(),
          attribute: 'name',
          newValue: factory.stringNext()
        },
        {
          updateFunc: () => component.updateDescription(),
          attribute: 'description',
          newValue: faker.lorem.paragraph()
        },
        {
          updateFunc: () => component.updateRecurring(),
          attribute: 'recurring',
          newValue: !eventType.recurring
        }
      ];

      const modalService = TestBed.get(NgbModal);
      const modalSpy = spyOn(modalService, 'open');
      spyOn(store, 'dispatch').and.callThrough();

      testData.forEach(testInfo => {
        modalSpy.and.returnValue({
          result: Promise.resolve({ confirmed: true, value: testInfo.newValue })
        });

        testInfo.updateFunc();
        fixture.whenStable().then(() => {
          const action = new EventTypeStoreActions.UpdateEventTypeRequest({
            eventType,
            attributeName: testInfo.attribute,
            value: testInfo.newValue.toString()
          });

          expect(store.dispatch).toHaveBeenCalledWith(action);
        });
      });
    }));

  });

  describe('for annotation types', () => {

    it('changes state when adding an annotation type', () => {
      const ngZone = TestBed.get(NgZone);
      const router = TestBed.get(Router);
      ngZone.run(() => router.initialNavigation());
      const eventType = componentSetup(fixture, store, factory);

      spyOn(router, 'navigate').and.callThrough();

      ngZone.run(() => component.addAnnotationType());
      expect(router.navigate).toHaveBeenCalled();
      expect((router.navigate as any).calls.mostRecent().args[0]).toEqual([ eventType.slug, 'annotationAdd' ]);
    });

    it('when an annotation type is edited, a state change is made', () => {
      const ngZone = TestBed.get(NgZone);
      const router = TestBed.get(Router);
      ngZone.run(() => router.initialNavigation());

      const eventType = componentSetup(fixture, store, factory);
      const annotationType = eventType.annotationTypes[0];

      store.dispatch(new EventTypeStoreActions.GetEventTypeSuccess({ eventType }));
      store.dispatch(new EventTypeStoreActions.EventTypeSelected({ id: eventType.id }));
      fixture.detectChanges();

      spyOn(router, 'navigate').and.callThrough();

      ngZone.run(() => component.editAnnotationType(eventType.annotationTypes[0]));
      expect(router.navigate).toHaveBeenCalled();
      expect((router.navigate as any).calls.mostRecent().args[0])
        .toEqual([ eventType.slug, 'annotation', annotationType.id ]);
    });

    describe('when removing an annotation type', () => {

      it('dispatches an event to update the event type', async(() => {
        const eventType = componentSetup(fixture, store, factory);

        const newRecurring = !eventType.recurring;
        const modalService = TestBed.get(NgbModal);
        const modalResult: ModalInputResult = { confirmed: true, value: newRecurring };

        spyOn(modalService, 'open').and.returnValue({
          componentInstance: {},
          result: Promise.resolve(modalResult)
        });
        spyOn(store, 'dispatch').and.callThrough();

        component.removeAnnotationType(eventType.annotationTypes[0]);
        fixture.whenStable().then(() => {
          const action = new EventTypeStoreActions.UpdateEventTypeRemoveAnnotationTypeRequest({
            eventType,
            annotationTypeId: eventType.annotationTypes[0].id
          });

          expect(store.dispatch).toHaveBeenCalledWith(action);
        });
      }));

    });

  });

  describe('for specimen definitions', () => {

    it('changes state when adding an specimen definition', () => {
      const ngZone = TestBed.get(NgZone);
      const router = TestBed.get(Router);
      ngZone.run(() => router.initialNavigation());

      const eventType = componentSetup(fixture, store, factory);

      spyOn(router, 'navigate').and.callThrough();

      ngZone.run(() => component.addSpecimenDefinition());
      expect(router.navigate).toHaveBeenCalled();
      expect((router.navigate as any).calls.mostRecent().args[0]).toEqual([ eventType.slug, 'spcDefAdd' ]);
    });

    it('when an specimen definition is edited, a state change is made', () => {
      const ngZone = TestBed.get(NgZone);
      const router = TestBed.get(Router);
      ngZone.run(() => router.initialNavigation());

      const eventType = componentSetup(fixture, store, factory);
      const specimenDefinition = eventType.specimenDefinitions[0];

      spyOn(router, 'navigate').and.callThrough();

      ngZone.run(() => component.editSpecimenDefinition(eventType.specimenDefinitions[0]));
      expect(router.navigate).toHaveBeenCalled();
      expect((router.navigate as any).calls.mostRecent().args[0])
        .toEqual([ eventType.slug, 'spcDef', specimenDefinition.id ]);
    });

    describe('when removing an specimen definition', () => {

      it('dispatches an event to update the event type', async(() => {
        const eventType = componentSetup(fixture, store, factory);
        const newRecurring = !eventType.recurring;
        const modalService = TestBed.get(NgbModal);
        const modalResult: ModalInputResult = { confirmed: true, value: newRecurring };

        spyOn(modalService, 'open').and.returnValue({
          componentInstance: {},
          result: Promise.resolve(modalResult)
        });
        spyOn(store, 'dispatch').and.callThrough();

        component.removeSpecimenDefinition(eventType.specimenDefinitions[0]);
        fixture.whenStable().then(() => {
          const action = new EventTypeStoreActions.UpdateEventTypeRemoveSpecimenDefinitionRequest({
            eventType,
            specimenDefinitionId: eventType.specimenDefinitions[0].id
          });

          expect(store.dispatch).toHaveBeenCalledWith(action);
        });
      }));

    });

  });

  describe('when removing an event type', () => {

    it('dispatches an event to update the event type', async(() => {
      const eventType = componentSetup(fixture, store, factory);
      const modalService = TestBed.get(NgbModal);

      spyOn(modalService, 'open').and.returnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      });
      spyOn(store, 'dispatch').and.callThrough();

      component.removeEventType();
      fixture.whenStable().then(() => {
        const action = new EventTypeStoreActions.RemoveEventTypeRequest({
          eventType
        });

        expect(store.dispatch).toHaveBeenCalledWith(action);
      });
    }));

    it('event type becomes undefined when removed', async(() => {
      const eventType = componentSetup(fixture, store, factory);

      fixture.whenStable().then(() => {
        const action = new EventTypeStoreActions.RemoveEventTypeSuccess({ eventTypeId: eventType.id });
        store.dispatch(action);

        fixture.whenStable().then(() => {
          expect(component.eventType).toBeUndefined();
        });
      });
    }));
  });

  function componentSetup(fixture, store, factory): CollectionEventType {
    const annotationType = factory.annotationType();
    const specimenDefinition = factory.collectedSpecimenDefinition();
    const eventType = new CollectionEventType().deserialize({
      ...factory.collectionEventType(),
      annotationTypes: [ annotationType ],
      specimenDefinitions: [ specimenDefinition ]
    });
    store.dispatch(new EventTypeStoreActions.GetEventTypeSuccess({ eventType }));
    store.dispatch(new EventTypeStoreActions.EventTypeSelected({ id: eventType.id }));
    fixture.detectChanges();

    return eventType;
  }

});
