import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionEventType, Study, StudyState } from '@app/domain/studies';
import {
  EventTypeStoreActions,
  EventTypeStoreReducer,
  RootStoreState,
  StudyStoreActions,
  StudyStoreReducer
} from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import * as faker from 'faker';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { EventTypeRemoveComponent } from '../event-type-remove/event-type-remove.component';
import { EventTypeViewContainerComponent } from './event-type-view.container';

describe('EventTypeViewContainer', () => {
  let component: EventTypeViewContainerComponent;
  let fixture: ComponentFixture<EventTypeViewContainerComponent>;
  const mockActivatedRoute = new MockActivatedRoute();
  let factory: Factory;
  let study: Study;
  let store: Store<RootStoreState.State>;
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
        StoreModule.forRoot(
          {
            study: StudyStoreReducer.reducer,
            'event-type': EventTypeStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [EventTypeViewContainerComponent, EventTypeRemoveComponent, YesNoPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [EventTypeRemoveComponent]
      }
    });
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(EventTypeViewContainerComponent);
    component = fixture.componentInstance;
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    const eventType = createEventType();
    createMockActivatedRouteSpies(study, eventType);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('navigates to new path when name is changed', fakeAsync(() => {
    const eventType = createEventType();
    createMockActivatedRouteSpies(study, eventType);
    componentSetup(study, eventType);

    const newName = factory.stringNext();
    const etWithNewName = new CollectionEventType().deserialize({
      ...(eventType as any),
      ...factory.nameAndSlug()
    });

    const modalService = TestBed.get(NgbModal);
    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newName) });
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.updateName();
    flush();
    fixture.detectChanges();

    store.dispatch(
      EventTypeStoreActions.updateEventTypeSuccess({
        eventType: etWithNewName
      })
    );
    flush();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([
      '/admin/studies',
      study.slug,
      'collection',
      'view',
      etWithNewName.slug
    ]);
  }));

  describe('when updating attributes', () => {
    let eventType: CollectionEventType;
    const context: EntityUpdateComponentBehaviour.Context<EventTypeViewContainerComponent> = {} as any;

    beforeEach(() => {
      eventType = createEventType();
      context.fixture = fixture;
      context.componentInitialize = () => {
        createMockActivatedRouteSpies(study, eventType);
        componentSetup(study, eventType);
        store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
      };
      context.componentValidateInitialization = () => undefined;
      context.dispatchSuccessAction = () => {
        store.dispatch(EventTypeStoreActions.updateEventTypeSuccess({ eventType }));
      };
      context.createExpectedFailureAction = error => EventTypeStoreActions.updateEventTypeFailure({ error });
      context.duplicateAttibuteValueError = 'already exists';
    });

    describe('when updating name', () => {
      beforeEach(() => {
        const newName = factory.stringNext();
        context.modalReturnValue = { result: Promise.resolve(newName) };
        context.updateEntity = () => {
          component.updateName();
        };

        const eventTypeWithUpdatedSlug = new CollectionEventType().deserialize({
          ...(eventType as any),
          slug: factory.slugify(newName),
          name: newName
        });

        context.expectedSuccessAction = EventTypeStoreActions.updateEventTypeRequest({
          eventType,
          attributeName: 'name',
          value: newName
        });
        context.dispatchSuccessAction = () => {
          store.dispatch(
            EventTypeStoreActions.updateEventTypeSuccess({
              eventType: eventTypeWithUpdatedSlug
            })
          );
        };
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when updating description', () => {
      beforeEach(() => {
        const newValue = faker.lorem.paragraphs();
        context.modalReturnValue = { result: Promise.resolve(newValue) };
        context.updateEntity = () => {
          component.updateDescription();
        };

        context.expectedSuccessAction = EventTypeStoreActions.updateEventTypeRequest({
          eventType,
          attributeName: 'description',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when updating recurring', () => {
      beforeEach(() => {
        const newValue = true;
        context.modalReturnValue = { result: Promise.resolve(newValue) };
        context.updateEntity = () => {
          component.updateRecurring();
        };

        context.expectedSuccessAction = EventTypeStoreActions.updateEventTypeRequest({
          eventType,
          attributeName: 'recurring',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });
  });

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
        ...(study as any),
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
        store.dispatch(EventTypeStoreActions.updateEventTypeSuccess({ eventType }));
      });

      flush();
      fixture.detectChanges();
      expect(toastrListener.mock.calls.length).toBe(componentUpdateFuncs.length);
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
      expect((router.navigate as any).calls.mostRecent().args[0]).toEqual(['annotationAdd']);
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
      expect((router.navigate as any).calls.mostRecent().args[0]).toEqual(['annotation', annotationType.id]);
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
          const action = EventTypeStoreActions.updateEventTypeRequest({
            eventType,
            attributeName: 'removeAnnotationType',
            value: eventType.annotationTypes[0].id
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
      expect((router.navigate as any).calls.mostRecent().args[0]).toEqual(['spc-def-add']);
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
      expect((router.navigate as any).calls.mostRecent().args[0]).toEqual(['spc-def', specimenDefinition.id]);
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
          const action = EventTypeStoreActions.updateEventTypeRequest({
            eventType,
            attributeName: 'removeSpecimenDefinition',
            value: eventType.specimenDefinitions[0].id
          });

          expect(store.dispatch).toHaveBeenCalledWith(action);
        });
      }));
    });
  });

  describe('when removing an event type', () => {
    it('dispatches an event', async(() => {
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
        const action = EventTypeStoreActions.removeEventTypeRequest({
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

      const action = EventTypeStoreActions.removeEventTypeSuccess({ eventTypeId: eventType.id });
      store.dispatch(action);
      flush();
      fixture.detectChanges();

      expect(routerListener).toHaveBeenCalled();
      expect(routerListener.mock.calls[0][0]).toEqual(['/admin/studies', study.slug, 'collection', 'view']);
    }));
  });

  function createEventType(): CollectionEventType {
    const annotationType = factory.annotationType();
    const specimenDefinition = factory.collectedSpecimenDefinition();
    const eventType = new CollectionEventType().deserialize({
      ...factory.collectionEventType({
        annotationTypes: [annotationType],
        specimenDefinitions: [specimenDefinition]
      })
    });
    return eventType;
  }

  function componentSetup(study: Study, eventType: CollectionEventType): void {
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    store.dispatch(EventTypeStoreActions.getEventTypeSuccess({ eventType }));
    fixture.detectChanges();
  }

  function createMockActivatedRouteSpies(study: Study, eventType: CollectionEventType): void {
    mockActivatedRoute.spyOnData(() => ({ eventType }));
    mockActivatedRoute.spyOnParams(() => eventType);

    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        parent: {
          parent: {
            snapshot: {
              data: {
                study
              },
              params: {
                slug: study.slug
              }
            }
          }
        }
      }
    }));

    mockActivatedRoute.spyOnSnapshot(() => ({
      data: {
        eventType
      },
      params: {
        eventTypeSlug: eventType.slug
      }
    }));
  }
});
