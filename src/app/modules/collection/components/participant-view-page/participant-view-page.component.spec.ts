import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgrxRuntimeChecks, ParticipantStoreReducer, StudyStoreReducer, RootStoreState, StudyStoreActions, ParticipantStoreActions } from '@app/root-store';
import { StoreModule, Store } from '@ngrx/store';
import { ParticipantViewPageComponent } from './participant-view-page.component';
import { Participant } from '@app/domain/participants';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Study } from '@app/domain/studies';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { cold } from 'jasmine-marbles';
import { of } from 'rxjs';

interface EntitiesOptions {
  study?: Study;
  participant?: Participant;
}

describe('ParticipantViewPageComponent', () => {
  let component: ParticipantViewPageComponent;
  let fixture: ComponentFixture<ParticipantViewPageComponent>;
  const factory = new Factory();
  let store: Store<RootStoreState.State>;
  const mockActivatedRoute = new MockActivatedRoute();
  let participant: Participant;

  beforeEach(async(() => {
    const entities = createEntities();
    participant = entities.participant;
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot(
          {
            'study':       StudyStoreReducer.reducer,
            'participant': ParticipantStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        },
        {
          provide: Router,
          useValue: {
            url: `/collection/${participant.slug}`,
            events: of(new NavigationEnd(0,
                                         `/collection/${participant.slug}`,
                                         `/collection/${participant.slug}`)),
            navigate: jasmine.createSpy('navigate')
          }
        }
      ],
      declarations: [ ParticipantViewPageComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantViewPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('entities are loaded from the store', () => {
    const entities = createEntities();
    dispatchEntities(entities);
    fixture.detectChanges();
    expect(component.participant$).toBeObservable(cold('d', { d: entities.participant }));
  });

  it('active tab is initialized from router\'s event', () => {
    const entities = createEntities();
    dispatchEntities(entities);
    fixture.detectChanges();
    expect(component.activeTabId).toBe('collection');
  });

  it('selecting a tab causes a state navigation', () => {
    const router = TestBed.get(Router);
    const navigateListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    const event = { activeId: 'summary', nextId: 'collection', preventDefault: () => {} };
    component.tabSelection(event);
    fixture.detectChanges();

    expect(navigateListener.mock.calls.length).toBe(1);
    expect(navigateListener.mock.calls[0][0]).toEqual([ '/collection', participant.slug, 'collection' ]);
  });

  function createEntities(options: EntitiesOptions = {}) {
    const study = (options.study !== undefined) ? options.study : new Study().deserialize(factory.study());
    const participant = (options.participant !== undefined)
      ?  options.participant : new Participant().deserialize(factory.participant());
    mockActivatedRouteSnapshot(participant);
    return { study, participant };
  }

  function mockActivatedRouteSnapshot(participant: Participant): void {
    mockActivatedRoute.spyOnSnapshot(() => ({
      data: {
        participant
      },
      params: {
        slug: participant.slug
      }
    }));
  }

  function dispatchEntities(options: EntitiesOptions = {}) {
    const { study, participant } = options;
    if (study) { store.dispatch(StudyStoreActions.getStudySuccess({ study })); }

    if (participant) { store.dispatch(ParticipantStoreActions.getParticipantSuccess({ participant })); }
  }
});
