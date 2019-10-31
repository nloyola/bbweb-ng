import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CentreViewComponent } from './centre-view.component';
import { Factory } from '@test/factory';
import { Centre } from '@app/domain/centres';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule, Store } from '@ngrx/store';
import { CentreStoreReducer, CentreStoreActions, RootStoreState, NgrxRuntimeChecks } from '@app/root-store';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MockActivatedRoute } from '@test/mocks';
import { cold } from 'jasmine-marbles';
import { NgZone } from '@angular/core';

describe('CentreViewComponent', () => {
  let component: CentreViewComponent;
  let fixture: ComponentFixture<CentreViewComponent>;
  let store: Store<RootStoreState.State>;
  const mockActivatedRoute = new MockActivatedRoute();
  const factory = new Factory();
  let centre: Centre;

  beforeEach(async(() => {
    centre = new Centre().deserialize(factory.centre());

    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            centre: CentreStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        },
        {
          provide: Router,
          useValue: {
            url: 'admin/centres',
            events: of(
              new NavigationEnd(
                0,
                `/admin/centres/${centre.slug}/studies`,
                `/admin/centres/${centre.slug}/studies`
              )
            ),
            navigate: jasmine.createSpy('navigate')
          }
        }
      ],
      declarations: [CentreViewComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(CentreViewComponent);
    component = fixture.componentInstance;
    createMockActivatedRouteSpies(centre);
    store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('retrieves the centre from the store', () => {
    fixture.detectChanges();
    expect(component.centre$).toBeObservable(cold('b', { b: centre }));
  });

  it("active tab is initialized from router's event", () => {
    fixture.detectChanges();
    expect(component.activeTabId).toBe('studies');
  });

  it('selecting a tab causes a state navigation', () => {
    const router = TestBed.get(Router);
    const routerListener = jest.spyOn(router, 'navigate');
    const ngZone = TestBed.get(NgZone);

    fixture.detectChanges();
    const event = { activeId: 'summary', nextId: 'locations', preventDefault: () => {} };
    ngZone.run(() => component.tabSelection(event));
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual(['/admin/centres', centre.slug, 'locations']);
  });

  function createMockActivatedRouteSpies(c: Centre): void {
    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {
        slug: c.slug
      }
    }));
  }
});
