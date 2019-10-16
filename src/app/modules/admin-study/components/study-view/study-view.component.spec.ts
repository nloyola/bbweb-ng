import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { NgrxRuntimeChecks, RootStoreState, StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold } from 'jasmine-marbles';
import { of } from 'rxjs';
import { StudyViewComponent } from './study-view.component';

describe('StudyViewComponent', () => {
  let component: StudyViewComponent;
  let fixture: ComponentFixture<StudyViewComponent>;
  let store: Store<RootStoreState.State>;
  const factory = new Factory();
  let study: Study;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StudyViewComponent],
      imports: [
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            study: StudyStoreReducer.reducer,
            spinner: SpinnerStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {}
        },
        {
          provide: Router,
          useValue: {}
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    study = new Study().deserialize(factory.study());
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(StudyViewComponent);
    component = fixture.componentInstance;
    updateRouter(study);
    updateActivatedRoute(study);
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('retrieves the study from the store', () => {
    fixture.detectChanges();
    expect(component.study$).toBeObservable(cold('b', { b: study }));
  });

  it("active tab is initialized from router's event", () => {
    fixture.detectChanges();
    expect(component.activeTabId).toBe('collection');
  });

  it('selecting a tab causes a state navigation', () => {
    fixture.detectChanges();
    const router = TestBed.get(Router);
    const event = { activeId: 'summary', nextId: 'collection', preventDefault: () => {} };
    component.tabSelection(event);
    fixture.detectChanges();

    expect(router.navigate.mock.calls.length).toBe(1);
    expect(router.navigate.mock.calls[0][0]).toEqual(['/admin/studies', study.slug, 'collection']);
  });

  function updateRouter(study: Study) {
    const router = TestBed.get(Router);
    router.url = 'admin/studies';
    router.events = of(
      new NavigationEnd(
        0,
        `/admin/studies/${study.slug}/collection`,
        `/admin/studies/${study.slug}/collection`
      )
    );
    router.navigate = jest.fn();
  }

  function updateActivatedRoute(study: Study) {
    TestBed.get(ActivatedRoute).snapshot = { params: { slug: study.slug } };
  }
});
