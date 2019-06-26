import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Participant } from '@app/domain/participants';
import { Study, StudyStateInfo, StudyState } from '@app/domain/studies';
import { EventTypeStoreReducer, NgrxRuntimeChecks, ParticipantStoreReducer, RootStoreState, StudyStoreReducer, StudyStoreActions, ParticipantStoreActions } from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { cold } from 'jasmine-marbles';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ParticipantAddPageComponent } from './participant-add-page.component';
import { SearchParams } from '@app/domain';

interface EntitiesOptions {
  study?: Study;
  participant?: Participant;
}

describe('ParticipantAddPageComponent', () => {

  let component: ParticipantAddPageComponent;
  let fixture: ComponentFixture<ParticipantAddPageComponent>;
  const mockActivatedRoute = new MockActivatedRoute();
  const factory = new Factory();
  let store: Store<RootStoreState.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(
          {
            'study':       StudyStoreReducer.reducer,
            'participant': ParticipantStoreReducer.reducer
          },
          NgrxRuntimeChecks),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [ ParticipantAddPageComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantAddPageComponent);
    component = fixture.componentInstance;

    store = TestBed.get(Store);
  });

  it('should create', () => {
    createEntities();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('user is shown that page is loading on initialization', () => {
    createEntities();
    fixture.detectChanges();
    expect(component.isLoading$).toBeObservable(cold('a', { a: true }));
  });

  it('uniqueId$ is valid on initialization', () => {
    const entities = createEntities();
    fixture.detectChanges();
    expect(component.uniqueId$).toBeObservable(cold('(a|)', { a: entities.participant.uniqueId }));
  });

  it('navigates to error page if there are no studies that can collect specimens', () => {
    const router = TestBed.get(Router);
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const entities = createEntities();

    store.dispatch(StudyStoreActions.searchCollectionStudiesRequest({ searchParams: new SearchParams() }));
    fixture.detectChanges();
    store.dispatch(StudyStoreActions.searchCollectionStudiesSuccess({ studiesData: [] }));
    store.dispatch(StudyStoreActions.getStudySuccess({ study: entities.study }));
    fixture.detectChanges();

    expect(component.collectionStudies$).toBeObservable(cold('a', { a: [] }));
    expect(routerListener.mock.calls.length).toBeGreaterThan(0);
    expect(routerListener.mock.calls[0][0]).toEqual([ '/server-error' ]);
  });

  it('collectionStudies$ is valid on initialization', () => {
    const entities = createEntities();
    dispatchEntities(entities);
    fixture.detectChanges();
    expect(component.collectionStudies$).toBeObservable(cold('a', { a: [ entities.study ] }));
  });

  it('when a study is selected an action is dispatched', () => {
    const entities = createEntities();
    dispatchEntities(entities);
    fixture.detectChanges();

    const storeListener = jest.spyOn(store, 'dispatch');
    component.studySelected(entities.study.slug);
    expect(storeListener.mock.calls.length).toBe(1);
    expect(storeListener.mock.calls[0][0])
      .toEqual(StudyStoreActions.getStudyRequest({ slug: entities.study.slug }));
  });

  describe('when submitting', () => {

    let router: Router;
    let toastr: ToastrService;

    beforeEach(() => {
      router = TestBed.get(Router);
      toastr = TestBed.get(ToastrService);
    });

    it('on valid submission', fakeAsync(() => {
      const entities = createEntities();
      const { participant } = entities;
      dispatchEntities(entities);
      fixture.detectChanges();
      const storeListener = jest.spyOn(store, 'dispatch');
      const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      const toastrListener = jest.spyOn(toastr, 'success').mockReturnValue(null);


      component.onSubmit(entities.participant);

      const expectedAction = ParticipantStoreActions.addParticipantRequest({ participant });

      expect(storeListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls[0][0]).toEqual(expectedAction);

      const action = ParticipantStoreActions.addParticipantSuccess({ participant });
      store.dispatch(action);
      fixture.detectChanges();
      flush();

      expect(toastrListener.mock.calls.length).toBe(1);
      expect(router.navigate).toHaveBeenCalled();
      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual([ `../../${participant.slug}` ]);
    }));

    it('on submission failure', fakeAsync(() => {
      const toastrListener = jest.spyOn(toastr, 'error').mockReturnValue(null);
      const entities = createEntities();
      const { participant } = entities;
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
            message: 'participant with unique ID already exists'
          }
        }
      ];

      dispatchEntities(entities);
      fixture.detectChanges();

      errors.forEach((error, index) => {
        component.onSubmit(participant);
        store.dispatch(ParticipantStoreActions.addParticipantFailure({ error }));
        flush();
        fixture.detectChanges();
        expect(toastrListener.mock.calls.length).toBe(index + 1);
      });
    }));

  });

  it('when user presses cancel button state is changed', () => {
    const entities = createEntities();
    dispatchEntities(entities);
    fixture.detectChanges();

    const router = TestBed.get(Router);
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onCancel();
    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([ '..' ]);
  });

  function createEntities(options: EntitiesOptions = {}) {
    const study = (options.study !== undefined) ? options.study : new Study().deserialize(factory.study());
    const participant = (options.participant !== undefined)
      ?  options.participant : new Participant().deserialize(factory.participant());
    mockActivatedRouteSnapshot(participant);
    return { study, participant };
  }

  function mockActivatedRouteSnapshot(participant: Participant): void {
    mockActivatedRoute.spyOnParams(() => ({ uniqueId: participant.uniqueId}));
  }

  function dispatchEntities(options: EntitiesOptions = {}) {
    const { study, participant } = options;
    if (study) {
      const studiesData = [
        new StudyStateInfo().deserialize(factory.entityNameAndStateDto<Study, StudyState>(study))
      ];
      store.dispatch(StudyStoreActions.searchCollectionStudiesRequest({ searchParams: new SearchParams() }));
      fixture.detectChanges();
      store.dispatch(StudyStoreActions.searchCollectionStudiesSuccess({ studiesData }));
      store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    }

    if (participant) { store.dispatch(ParticipantStoreActions.getParticipantSuccess({ participant })); }

  }
});
