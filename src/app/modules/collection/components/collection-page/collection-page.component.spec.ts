import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, flush, fakeAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study, StudyState, StudyStateInfo } from '@app/domain/studies';
import { User } from '@app/domain/users';
import { ParticipantStoreReducer, RootStoreState, StudyStoreActions, StudyStoreReducer, NgrxRuntimeChecks, ParticipantStoreActions } from '@app/root-store';
import { AuthStoreActions, AuthStoreReducer } from '@app/root-store/auth-store';
import { TruncatePipe } from '@app/shared/pipes';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrService } from 'ngx-toastr';
import { CollectionPageComponent } from './collection-page.component';
import { Participant } from '@app/domain/participants';
import { RoleIds } from '@app/domain/access';
import { SearchParams, PagedReply } from '@app/domain';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { getParticipantRequest } from '@app/root-store/participant/participant.actions';
import { cold } from 'jasmine-marbles';

interface EntitiesOptions {
  user?: User;
  study?: Study;
  studiesData?: StudyStateInfo[];
  participant?: Participant;
}

describe('CollectionPageComponent', () => {

  let component: CollectionPageComponent;
  let fixture: ComponentFixture<CollectionPageComponent>;
  let store: Store<RootStoreState.State>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            'study': StudyStoreReducer.reducer,
            'participant': ParticipantStoreReducer.reducer,
            'auth': AuthStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      declarations: [
        CollectionPageComponent,
        TruncatePipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('when loading', () => {

    it('should show loading', () => {
      const user = new User().deserialize(factory.user());
      createEntities({ user });
      store.dispatch(AuthStoreActions.loginSuccessAction({ user }));
      expect('loading').toBeTruthy();
    });

    it('on invalid user should show invalidUser template', () => {
      const user = new User().deserialize(factory.user());
      expect(user.roles.length).toBeLessThanOrEqual(0);
      const entities = createEntities({ user });

      dispatchEntities(entities);
      fixture.detectChanges();

      const alerts = fixture.debugElement.queryAll(By.css('.alert'));
      const textContent = alerts.map(a => a.nativeElement.textContent).join();
      expect(textContent).toContain(
        'You are not allowed to collect specimens. Please contact your website administrator.');
    });

  });

  describe('when submitting', () => {

    it('on submit the corresponding action is dispatched', () => {
      const entities = createEntities();
      const { participant } = entities;
      dispatchEntities(entities);

      const storeListener = jest.spyOn(store, 'dispatch');
      component.form.get('uniqueId').setValue(participant.uniqueId);
      component.onSubmit();

      const expectedAction = ParticipantStoreActions.getParticipantRequest({
        uniqueId: participant.uniqueId
      });
      expect(storeListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls[0][0]).toEqual(expectedAction);
    });

    it('on nonexistent participant should show participantCreateModal', () => {
      const entities = createEntities();
      const { participant } = entities;

      const modalListener = jest.spyOn(TestBed.get(NgbModal), 'open')
        .mockReturnValue({ result: Promise.resolve('OK') });
      jest.spyOn(TestBed.get(Router), 'navigate').mockResolvedValue(true);

      dispatchEntities(entities);
      component.form.get('uniqueId').setValue(participant.uniqueId);

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

      errors.forEach((error) => {
        modalListener.mockClear();
        component.onSubmit();
        fixture.detectChanges();
        store.dispatch(ParticipantStoreActions.getParticipantFailure(error as any));
        fixture.detectChanges();

        expect(modalListener.mock.calls.length).toBe(1);
        expect(modalListener.mock.calls[0][0]).toEqual(component.participantCreateModal);
      });
    });

    it('navigates to new path when user enter an existing participant', () => {
      const routerListener = jest.spyOn(TestBed.get(Router), 'navigate').mockResolvedValue(true);
      const entities = createEntities();
      const { participant } = entities;
      dispatchEntities(entities);

      component.form.get('uniqueId').setValue(participant.uniqueId);
      component.onSubmit();

      store.dispatch(ParticipantStoreActions.getParticipantSuccess({ participant }));
      fixture.detectChanges();

      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual([ participant.slug ]);
    });

    it('if server finds the wrong participant, client should throw an error', () => {
      const wrongParticipant = new Participant().deserialize(factory.participant());
      jest.spyOn(TestBed.get(Router), 'navigate').mockResolvedValue(true);

      const entities = createEntities();
      dispatchEntities(entities);
      fixture.detectChanges();

      component.form.get('uniqueId').setValue(entities.participant.uniqueId);
      component.onSubmit();
      fixture.detectChanges();

      store.dispatch(ParticipantStoreActions.getParticipantSuccess({ participant: wrongParticipant }));
      expect(component.participant$).toBeObservable(cold('#', null, new Error('participant not found')));
    });

  });

  it('when cancel button is pressed on modal, corresponding values are reinitialized', fakeAsync(() => {
    const entities = createEntities();
    const { study, studiesData } = entities;
    dispatchEntities(entities);

    const modalListener = jest.spyOn(TestBed.get(NgbModal), 'open')
      .mockReturnValue({ result: Promise.reject('Cancel') });

    jest.spyOn(TestBed.get(Router), 'navigate').mockResolvedValue(true);
    const participant = new Participant().deserialize(factory.participant());
    component.form.get('uniqueId').setValue(participant.uniqueId);

    const error = {
      status: 404,
      error: {
        message: 'simulated error'
      }
    };

    modalListener.mockClear();
    component.onSubmit();
    fixture.detectChanges();
    store.dispatch(ParticipantStoreActions.getParticipantFailure(error as any));
    fixture.detectChanges();

    flush();
    fixture.detectChanges();

    expect(component.form.get('uniqueId').value).toBe('');
    expect(component.participantLoading$).toBeObservable(cold('a', { a: false }));
  }));

  it('uniqueId getter should return the uniqueId value from the form', () => {
    const { participant } = createEntities();
    fixture.detectChanges();
    component.form.get('uniqueId').setValue(participant.uniqueId);
    expect(component.uniqueId.value).toBe(participant.uniqueId);
  });

  function createEntities(options: EntitiesOptions = {}) {
    const study = (options.study !== undefined) ? options.study : new Study().deserialize(factory.study());
    const studiesData = (options.studiesData !== undefined) ? options.studiesData : [
      new StudyStateInfo().deserialize(factory.entityNameAndStateDto<Study, StudyState>(study))
    ];
    const participant = (options.participant !== undefined)
      ?  options.participant : new Participant().deserialize(factory.participant());
    const user = (options.user !== undefined) ? options.user : new User().deserialize(factory.user({
      roles: [
        factory.role({ id: RoleIds.SpecimenCollector })
      ]
    }));
    return { study, studiesData, participant, user  };
  }

  function dispatchEntities(options: EntitiesOptions = {}) {
    const { study, studiesData, user} = options;
    if (study) {
      store.dispatch(StudyStoreActions.searchCollectionStudiesSuccess({ studiesData }));
    }
    if (user) { store.dispatch(AuthStoreActions.loginSuccessAction({ user })); }
  }

});
