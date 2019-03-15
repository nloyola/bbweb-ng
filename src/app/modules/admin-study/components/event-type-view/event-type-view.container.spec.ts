import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionEventType, Study, StudyState } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreReducer, StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import * as faker from 'faker';
import { cold } from 'jasmine-marbles';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { EventTypeRemoveComponent } from '../event-type-remove/event-type-remove.component';
import { EventTypeViewContainerComponent } from './event-type-view.container';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

describe('EventTypeViewContainer', () => {
  let component: EventTypeViewContainerComponent;
  let fixture: ComponentFixture<EventTypeViewContainerComponent>;
  const mockActivatedRoute = new MockActivatedRoute();
  let factory: Factory;
  let study: Study;
  let store: Store<StudyStoreReducer.State>;
  let router: Router;

  beforeEach(async(() => {
    factory = new Factory();
    study = new Study().deserialize({
      ...factory.study(),
      state: StudyState.Disabled
    });

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NgbModule,
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
          useValue: mockActivatedRoute
        }
      ],
      declarations: [
        EventTypeViewContainerComponent,
        EventTypeRemoveComponent,
        YesNoPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          EventTypeRemoveComponent
        ]
      }
    });
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(EventTypeViewContainerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const eventType = createEventType();
    createMockActivatedRouteSpies(study, eventType);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('allow changes is resolved', () => {
    const eventType = createEventType();
    createMockActivatedRouteSpies(study, eventType);
    componentSetup(study, eventType);
    fixture.detectChanges();

    const stateValues = [
      { state: StudyState.Enabled, expectedAllowChanges: false },
      { state: StudyState.Disabled, expectedAllowChanges: true },
    ];

    stateValues.forEach(stateValue => {
      const updatedStudy = new Study().deserialize({
        ...study as any,
        state: stateValue.state
      });
      store.dispatch(new StudyStoreActions.UpdateStudySuccess({ study: updatedStudy }));

      fixture.detectChanges();
      expect(component.allowChanges).toBe(stateValue.expectedAllowChanges);
    });
  });

  it('updates to event types are received', () => {
    const eventType = createEventType();
    createMockActivatedRouteSpies(study, eventType);
    componentSetup(study, eventType);
    const recurringValues = [ !eventType.recurring, eventType.recurring ];

    recurringValues.forEach(recurringValue => {
      const updatedEventType = new CollectionEventType().deserialize({
        ...eventType as any,
        recurring: recurringValue
      });

      store.dispatch(new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType: updatedEventType }));

      fixture.detectChanges();
      expect(component.eventType).toEqual(updatedEventType);
    });
  });

  it('navigates to new path when name is changed', fakeAsync(() => {
    const eventType = createEventType();
    createMockActivatedRouteSpies(study, eventType);
    componentSetup(study, eventType);

    const newName = factory.stringNext();
    const etWithNewName = new CollectionEventType().deserialize({
      ...eventType as any,
      ...factory.nameAndSlug()
    });

    const modalService = TestBed.get(NgbModal);
    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newName) });
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.updateName();
    flush();
    fixture.detectChanges();

    store.dispatch(new EventTypeStoreActions.UpdateEventTypeSuccess({
      eventType: etWithNewName
    }));
    flush();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([
      `/admin/studies/${study.slug}/collection/view/${etWithNewName.slug}`]);
  }));

  describe('common behaviour', () => {

    const componentUpdateFuncs = [
      (c, et) => c.updateName(),
      (c, et) => c.updateDescription(),
      (c, et) => c.updateRecurring(),
      (c, et) => c.removeAnnotationType(et.annotationTypes[0]),
      (c, et) => c.removeSpecimenDefinition(et.specimenDefinitions[0]),
      (c, et) => c.removeEventType()
    ];

    it('functions should open a modal', () => {
      const eventType = createEventType();
      createMockActivatedRouteSpies(study, eventType);
      componentSetup(study, eventType);

      const modalService = TestBed.get(NgbModal);
      spyOn(modalService, 'open').and.returnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      });

      const componentModalFuncs = componentUpdateFuncs.concat([
        (c, et) => c.viewAnnotationType(et.annotationTypes[0]),
        (c, et) => c.viewSpecimenDefinition(et.specimenDefinitions[0])
      ]);

      componentModalFuncs.forEach(modalFunc => modalFunc(component, eventType));
      expect(modalService.open.calls.count()).toBe(componentModalFuncs.length);
    });

    it('functions should throw an error when study is not disabled', () => {
      const updatedStudy = new Study().deserialize({
        ...study as any,
        state: StudyState.Enabled
      });
      const eventType = createEventType();
      createMockActivatedRouteSpies(updatedStudy, eventType);
      componentSetup(updatedStudy, eventType);

      const throwErrFuncs = componentUpdateFuncs.concat([
        (c, et) => c.addAnnotationType(et.annotationTypes[0]),
        (c, et) => c.editAnnotationType(et.annotationTypes[0]),
        (c, et) => c.addSpecimenDefinition(et.specimenDefinitions[0]),
        (c, et) => c.editSpecimenDefinition(et.specimenDefinitions[0])
      ]);

      throwErrFuncs.forEach(modalFunc => {
        expect(() => modalFunc(component, eventType)).toThrowError('modifications not allowed');
      });
    });

    it('functions that should notify the user', fakeAsync(() => {
      const toastr = TestBed.get(ToastrService);
      const modalService = TestBed.get(NgbModal);
      const modalSpy = spyOn(modalService, 'open');
      jest.spyOn(router, 'navigate').mockResolvedValue(true);
      const toastrListener = jest.spyOn(toastr, 'success').mockReturnValue(null);

      const eventType = createEventType();
      createMockActivatedRouteSpies(study, eventType);
      componentSetup(study, eventType);

      componentUpdateFuncs.forEach(updateFunc => {
        modalSpy.and.returnValue({
          componentInstance: {},
          result: Promise.resolve('test')
        });

        updateFunc(component, eventType);
        flush();
        fixture.detectChanges();
        store.dispatch(new EventTypeStoreActions.UpdateEventTypeSuccess({ eventType }));
      });

      flush();
      fixture.detectChanges();
      expect(toastrListener.mock.calls.length).toBe(componentUpdateFuncs.length);
    }));

  });

  describe('when updating name, description and recurring', () => {

    it('dispatches an action to update the event type', fakeAsync(() => {
      const eventType = createEventType();
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
      const modalListener = jest.spyOn(modalService, 'open');
      const storeListener = jest.spyOn(store, 'dispatch');

      createMockActivatedRouteSpies(study, eventType);
      componentSetup(study, eventType);

      testData.forEach(testInfo => {
        storeListener.mockReset();
        modalListener.mockReturnValue({ result: Promise.resolve(testInfo.newValue) });

        testInfo.updateFunc();
        flush();
        fixture.detectChanges();

        const action = new EventTypeStoreActions.UpdateEventTypeRequest({
          eventType,
          attributeName: testInfo.attribute,
          value: testInfo.newValue
        });

        expect(storeListener.mock.calls[0][0]).toEqual(action);
      });
    }));

  });

  describe('for annotation types', () => {

    it('changes state when adding an annotation type', () => {
      const ngZone = TestBed.get(NgZone);
      ngZone.run(() => router.initialNavigation());
      const eventType = createEventType();

      spyOn(router, 'navigate').and.callThrough();

      createMockActivatedRouteSpies(study, eventType);
      componentSetup(study, eventType);

      ngZone.run(() => component.addAnnotationType());
      expect(router.navigate).toHaveBeenCalled();
      expect((router.navigate as any).calls.mostRecent().args[0]).toEqual([ 'annotationAdd' ]);
    });

    it('when an annotation type is edited, a state change is made', () => {
      const ngZone = TestBed.get(NgZone);
      ngZone.run(() => router.initialNavigation());

      const eventType = createEventType();
      const annotationType = eventType.annotationTypes[0];

      createMockActivatedRouteSpies(study, eventType);
      componentSetup(study, eventType);

      spyOn(router, 'navigate').and.callThrough();

      ngZone.run(() => component.editAnnotationType(eventType.annotationTypes[0]));
      expect(router.navigate).toHaveBeenCalled();
      expect((router.navigate as any).calls.mostRecent().args[0])
        .toEqual([ 'annotation', annotationType.id ]);
    });

    describe('when removing an annotation type', () => {

      it('dispatches an event to update the event type', async(() => {
        const eventType = createEventType();

        const modalService = TestBed.get(NgbModal);

        spyOn(modalService, 'open').and.returnValue({
          componentInstance: {},
          result: Promise.resolve(true)
        });
        spyOn(store, 'dispatch').and.callThrough();

        createMockActivatedRouteSpies(study, eventType);
        componentSetup(study, eventType);

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
      ngZone.run(() => router.initialNavigation());

      const eventType = createEventType();

      spyOn(router, 'navigate').and.callThrough();

      createMockActivatedRouteSpies(study, eventType);
      componentSetup(study, eventType);

      ngZone.run(() => component.addSpecimenDefinition());
      expect(router.navigate).toHaveBeenCalled();
      expect((router.navigate as any).calls.mostRecent().args[0]).toEqual([ 'spcDefAdd' ]);
    });

    it('when an specimen definition is edited, a state change is made', () => {
      const ngZone = TestBed.get(NgZone);
      ngZone.run(() => router.initialNavigation());

      const eventType = createEventType();
      const specimenDefinition = eventType.specimenDefinitions[0];

      spyOn(router, 'navigate').and.callThrough();

      createMockActivatedRouteSpies(study, eventType);
      componentSetup(study, eventType);

      ngZone.run(() => component.editSpecimenDefinition(eventType.specimenDefinitions[0]));
      expect(router.navigate).toHaveBeenCalled();
      expect((router.navigate as any).calls.mostRecent().args[0])
        .toEqual([ 'spcDef', specimenDefinition.id ]);
    });

    describe('when removing an specimen definition', () => {

      it('dispatches an event to update the event type', async(() => {
        const eventType = createEventType();
        const newRecurring = !eventType.recurring;
        const modalService = TestBed.get(NgbModal);
        const modalResult = newRecurring;

        spyOn(modalService, 'open').and.returnValue({
          componentInstance: {},
          result: Promise.resolve(modalResult)
        });
        spyOn(store, 'dispatch').and.callThrough();

        createMockActivatedRouteSpies(study, eventType);
        componentSetup(study, eventType);

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
      const eventType = createEventType();
      const modalService = TestBed.get(NgbModal);

      spyOn(modalService, 'open').and.returnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      });
      spyOn(store, 'dispatch').and.callThrough();

      createMockActivatedRouteSpies(study, eventType);
      componentSetup(study, eventType);

      component.removeEventType();
      fixture.whenStable().then(() => {
        const action = new EventTypeStoreActions.RemoveEventTypeRequest({
          eventType
        });

        expect(store.dispatch).toHaveBeenCalledWith(action);
      });
    }));

    it('event type becomes undefined when removed', fakeAsync(() => {
      const eventType = createEventType();
      const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      const modalService = TestBed.get(NgbModal);

      jest.spyOn(modalService, 'open').mockReturnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      });
      createMockActivatedRouteSpies(study, eventType);
      componentSetup(study, eventType);

      component.removeEventType();
      flush();
      fixture.detectChanges();

      const action = new EventTypeStoreActions.RemoveEventTypeSuccess({ eventTypeId: eventType.id });
      store.dispatch(action);
      flush();
      fixture.detectChanges();

      expect(routerListener).toHaveBeenCalled();
      expect(routerListener.mock.calls[0][0]).toEqual([ `/admin/studies/${study.slug}/collection/view` ]);
    }));
  });

  function createEventType(): CollectionEventType {
    const annotationType = factory.annotationType();
    const specimenDefinition = factory.collectedSpecimenDefinition();
    const eventType = new CollectionEventType().deserialize({
      ...factory.collectionEventType(),
      annotationTypes: [ annotationType ],
      specimenDefinitions: [ specimenDefinition ]
    });
    return eventType;
  }

  /* tslint:disable:no-shadowed-variable */
  function componentSetup(study: Study, eventType: CollectionEventType): void {
    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
    store.dispatch(new EventTypeStoreActions.GetEventTypeSuccess({ eventType }));
    fixture.detectChanges();
  }

  function createMockActivatedRouteSpies(study: Study, eventType: CollectionEventType): void {
    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        parent: {
          parent: {
            snapshot: {
              params: {
                slug: study.slug
              }
            }
          }
        }
      }
    }));

    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {
        eventTypeSlug: eventType.slug
      }
    }));
  }
  /* tslint:enable:no-shadowed-variable */

});
