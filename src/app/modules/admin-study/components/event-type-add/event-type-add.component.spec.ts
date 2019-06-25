import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectionEventType, Study } from '@app/domain/studies';
import { EventTypeStoreActions, EventTypeStoreReducer, RootStoreState, NgrxRuntimeChecks } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { EventTypeAddComponent } from './event-type-add.component';

describe('EventTypeAddComponent', () => {

  let store: Store<RootStoreState.State>;
  let component: EventTypeAddComponent;
  let fixture: ComponentFixture<EventTypeAddComponent>;
  let ngZone: NgZone;
  let router: Router;
  let factory: Factory;
  let study: Study;

  beforeEach(async(() => {
    factory = new Factory();
    study = new Study().deserialize(factory.study());

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            'event-type': EventTypeStoreReducer.reducer,
            'spinner': SpinnerStoreReducer.reducer
          },
          NgrxRuntimeChecks),
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
      declarations: [ EventTypeAddComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    store = TestBed.get(Store);
    router = TestBed.get(Router);

    fixture = TestBed.createComponent(EventTypeAddComponent);
    component = fixture.componentInstance;
    ngZone.run(() => router.initialNavigation());
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when submitting', () => {

    it('on valid submission', async(() => {
      const toastr = TestBed.get(ToastrService);
      const eventType = createEventType();
      const eventTypeToAdd = new CollectionEventType().deserialize({
        name: eventType.name,
        description: eventType.description,
        recurring: eventType.recurring,
        studyId: study.id
      } as any);

      const storeListener = jest.spyOn(store, 'dispatch');
      const toastrListener = jest.spyOn(toastr, 'success').mockReturnValue(null);
      const routerListener = jest.spyOn(router, 'navigate');

      fixture.detectChanges();

      component.name.setValue(eventType.name);
      component.description.setValue(eventType.description);
      component.recurring.setValue(eventType.recurring);
      component.onSubmit();
      fixture.detectChanges();

      expect(storeListener.mock.calls[0][0]).toEqual(
        EventTypeStoreActions.addEventTypeRequest({ eventType: eventTypeToAdd }));

      ngZone.run(() => store.dispatch(EventTypeStoreActions.addEventTypeSuccess({ eventType })));
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        expect(storeListener.mock.calls.length).toBe(3);
        expect(toastrListener.mock.calls.length).toBe(1);
        expect(routerListener.mock.calls.length).toBe(1);
        expect(routerListener.mock.calls[0][0]).toEqual(['../view', eventType.slug ]);
      });
    }));

    it('on submission failure', fakeAsync(() => {
      const toastr = TestBed.get(ToastrService);
      const eventType = createEventType();
      const errors = [
        {
          status: 401,
          statusText: 'Unauthorized'
        },
        {
          status: 404,
          error: {
            message: 'simulated error'
          }
        },
        {
          status: 404,
          error: {
            message: 'EntityCriteriaError: name already used'
          }
        }
      ];

      jest.spyOn(toastr, 'error').mockReturnValue(null);

      fixture.detectChanges();

      errors.forEach(error => {
        component.name.setValue(eventType.name);
        component.description.setValue(eventType.description);
        component.recurring.setValue(eventType.recurring);
        component.onSubmit();
        store.dispatch(EventTypeStoreActions.addEventTypeFailure({ error }));
        flush();
        fixture.detectChanges();
        expect(toastr.error).toHaveBeenCalled();
      });
    }));

  });

  it('returns to the correct state when Cancel button is pressed', () => {
    const spy = jest.spyOn(router, 'navigate');
    fixture.detectChanges();

    ngZone.run(() => component.onCancel());
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.length).toBe(1);
    expect(spy.mock.calls[0][0]).toEqual([ '..' ]);
  });

  function createEventType(): CollectionEventType {
    return new CollectionEventType().deserialize(factory.collectionEventType());
  }
});
