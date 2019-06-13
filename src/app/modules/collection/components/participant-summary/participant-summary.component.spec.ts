import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { annotationFromType } from '@app/domain/annotations';
import { Participant } from '@app/domain/participants';
import { Study } from '@app/domain/studies';
import { EventStoreReducer, ParticipantStoreActions, ParticipantStoreReducer, StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { NgbActiveModal, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { cold } from 'jasmine-marbles';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ParticipantSummaryComponent } from './participant-summary.component';

interface EntitiesOptions {
  study?: Study;
  participant?: Participant;
}

describe('ParticipantSummaryComponent', () => {

  let component: ParticipantSummaryComponent;
  let fixture: ComponentFixture<ParticipantSummaryComponent>;
  const mockActivatedRoute = new MockActivatedRoute();
  const factory = new Factory();
  let store: Store<ParticipantStoreReducer.State>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'participant': ParticipantStoreReducer.reducer,
          'event': EventStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        NgbActiveModal,
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [
        ParticipantSummaryComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantSummaryComponent);
    component = fixture.componentInstance;

    store = TestBed.get(Store);
  });

  it('should create', () => {
    createEntities();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('entities are loaded from the store', () => {
    const { study, participant } = createEntities();
    fixture.detectChanges();
    expect(component.entities$).toBeObservable(cold('a', { a: undefined }));

    dispatchEntities({ study, participant });
    fixture.detectChanges();
    expect(component.entities$).toBeObservable(cold('(ab)', { a: undefined, b: { participant, study } }));
  });

  it('requests study if not in the store', () => {
    const { study, participant } = createEntities();
    const storeListener = jest.spyOn(store, 'dispatch');
    dispatchEntities({ study: null, participant });
    fixture.detectChanges();
    expect(component.entities$).toBeObservable(
      cold('a', { a: { participant, study: undefined } }));

    const action = StudyStoreActions.getStudyRequest({ slug: study.slug });
    expect(storeListener.mock.calls.length).toBe(2);
    expect(storeListener.mock.calls[1][0]).toEqual(action);
  });

  it('participant observable has valid value', () => {
    const { study, participant } = createEntities();
    dispatchEntities({ study, participant });
    fixture.detectChanges();
    expect(component.participant$).toBeObservable(cold('a', { a: participant }));
  });

  it('annotations observable has valid value', () => {
    const study = new Study().deserialize(factory.study({ annotationTypes: [ factory.annotationType() ] }));
    const { participant } = createEntities({ study });
    dispatchEntities({ study, participant });
    fixture.detectChanges();
    const annotation = annotationFromType(study.annotationTypes[0]);
    expect(component.annotations$).toBeObservable(cold('a', { a: [ annotation ] }));
  });

  describe('when updating unique ID', () => {

    let modalService: NgbModal;
    let router: Router;
    let routerListener: any;

    beforeEach(() => {
      modalService = TestBed.get(NgbModal);
      router = TestBed.get(Router);

      routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    });

    it('navigates to new path when participant unique ID is changed', fakeAsync(() => {
      const { study, participant } = createEntities();
      dispatchEntities({ study, participant });
      fixture.detectChanges();

      const newUniqueIdAndSlug = factory.nameAndSlug();
      const participantWithNewUniqueId = new Participant().deserialize({
        ...participant as any,
        uniqueId: newUniqueIdAndSlug.name,
        slug: newUniqueIdAndSlug.slug
      });

      jest.spyOn(modalService, 'open')
        .mockReturnValue({ result: Promise.resolve(newUniqueIdAndSlug.name) } as any);
      component.updateUniqueId()
      flush();
      fixture.detectChanges();

      const action = ParticipantStoreActions.updateParticipantSuccess({ participant: participantWithNewUniqueId });
      store.dispatch(action);
      flush();
      fixture.detectChanges();

      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual([ '../..', participantWithNewUniqueId.slug, 'summary' ]);
    }));

    it('displays an error if an existing unique ID is entered', fakeAsync(() => {
      const toastr = TestBed.get(ToastrService);
      const toastrListener = jest.spyOn(toastr, 'error').mockReturnValue(null);

      const error = {
        status: 404,
        error: {
          message: 'participant with unique ID already exists'
        }
      };

      const { study, participant } = createEntities();
      dispatchEntities({ study, participant });
      fixture.detectChanges();

      jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve("") } as any);
      component.updateUniqueId()
      flush();
      fixture.detectChanges();

      store.dispatch(ParticipantStoreActions.updateParticipantFailure({ error }));
      flush();
      fixture.detectChanges();
      expect(toastrListener.mock.calls.length).toBe(1);
      expect(toastrListener.mock.calls[0][0]).toMatch(/A participant with the ID.*already exits/);
    }));

  });

  describe('when updating an annotation', () => {

    let modalService: NgbModal;
    let toastr: ToastrService;
    let dispatchListener: any;

    beforeEach(() => {
      modalService = TestBed.get(NgbModal);
      toastr = TestBed.get(ToastrService);
      dispatchListener = jest.spyOn(store, 'dispatch');
    });

    it('should open a modal, send the server an update request, and display a toastr message', fakeAsync(() => {
      const study = new Study().deserialize(factory.study({ annotationTypes: [ factory.annotationType() ] }));
      const annotation = annotationFromType(study.annotationTypes[0]);
      const { participant } = createEntities({ study });
      participant.annotations = [ annotation ];
      dispatchEntities({ study, participant });
      fixture.detectChanges();

      dispatchListener.mockClear();
      const modalListener = jest.spyOn(modalService, 'open')
        .mockReturnValue({ result: Promise.resolve(annotation) } as any);
      component.updateAnnotation(annotation);
      flush();
      fixture.detectChanges();
      expect(modalListener.mock.calls.length).toBe(1);
      expect(dispatchListener.mock.calls.length).toBe(1);
      const action = ParticipantStoreActions.updateParticipantRequest({
          participant,
          attributeName: 'addAnnotation',
          value: annotation.serverAnnotation()
      });
      expect(dispatchListener.mock.calls[0][0]).toEqual(action);

      const toastrListener = jest.spyOn(toastr, 'success').mockReturnValue(null);
      store.dispatch(ParticipantStoreActions.updateParticipantSuccess({ participant }));
      flush();
      fixture.detectChanges();
      expect(toastrListener.mock.calls.length).toBe(1);
      expect(toastrListener.mock.calls[0][0]).toMatch(/was updated/);
    }));

    it('when server responds with an error it displays it', fakeAsync(() => {
      const toastrListener = jest.spyOn(toastr, 'error').mockReturnValue(null);
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
        }
      ];

      const study = new Study().deserialize(factory.study({ annotationTypes: [ factory.annotationType() ] }));
      const { participant } = createEntities({ study });
      const annotation = annotationFromType(study.annotationTypes[0]);
      dispatchEntities({ study, participant });
      fixture.detectChanges();

      jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(annotation) } as any);
      errors.forEach(error => {
        toastrListener.mockClear();
        component.updateAnnotation(annotation)
        flush();
        fixture.detectChanges();

        store.dispatch(ParticipantStoreActions.updateParticipantFailure({ error }));
        flush();
        fixture.detectChanges();
        expect(toastrListener.mock.calls.length).toBe(1);
      });
    }));

  });

  function mockActivatedRouteSnapshot(participant: Participant): void {
    mockActivatedRoute.spyOnParent(() => ({
      snapshot: {
        data: {
          participant
        },
        params: {
          slug: participant.slug
        }
      }
    }));

    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {}
    }));
  }

  function createEntities(options: EntitiesOptions = {}) {
    const study = (options.study !== undefined) ? options.study : new Study().deserialize(factory.study());
    const participant = (options.participant !== undefined)
      ?  options.participant : new Participant().deserialize(factory.participant());
    mockActivatedRouteSnapshot(participant);
    return { study, participant };
  }

  function dispatchEntities(options: EntitiesOptions = {}) {
    const { study, participant } = options;
    if (study) {
      store.dispatch(StudyStoreActions.getStudySuccess({ study: study }));
    }

    if (participant) {
      store.dispatch(ParticipantStoreActions.getParticipantSuccess({ participant: participant }));
    }
  }
});
