import { NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { RootStoreState, StudyStoreActions, StudyStoreReducer, NgrxRuntimeChecks } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { cold } from 'jasmine-marbles';
import { of } from 'rxjs';
import { StudyViewComponent } from './study-view.component';

describe('StudyViewComponent', () => {

  let component: StudyViewComponent;
  let fixture: ComponentFixture<StudyViewComponent>;
  let store: Store<RootStoreState.State>;
  const mockActivatedRoute = new MockActivatedRoute();
  const factory = new Factory();
  let study: Study;

  beforeEach(async(() => {
    study = new Study().deserialize(factory.study());

    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            'study': StudyStoreReducer.reducer,
            'spinner': SpinnerStoreReducer.reducer
          },
          NgrxRuntimeChecks)
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        },
        {
          provide: Router,
          useValue: {
            url: 'admin/studies',
            events: of(new NavigationEnd(0,
                                         `/admin/studies/${study.slug}/collection`,
                                         `/admin/studies/${study.slug}/collection`)),
            navigate: jasmine.createSpy('navigate')
          }
        }
      ],
      declarations: [ StudyViewComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(StudyViewComponent);
    component = fixture.componentInstance;
    createMockActivatedRouteSpies(study);
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

  it('active tab is initialized from router\'s event', () => {
    fixture.detectChanges();
    expect(component.activeTabId).toBe('collection');
  });

  it('selecting a tab causes a state navigation', () => {
    const router = TestBed.get(Router);
    const routerListener = jest.spyOn(router, 'navigate');
    const ngZone = TestBed.get(NgZone);

    fixture.detectChanges();
    const event = { activeId: 'summary', nextId: 'collection', preventDefault: () => {} };
    ngZone.run(() => component.tabSelection(event));
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual([ '/admin/studies', study.slug, 'collection' ]);
  });

  function createMockActivatedRouteSpies(s: Study): void {
    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {
        slug: s.slug
      }
    }));
  }
});
