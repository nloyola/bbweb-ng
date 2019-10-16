import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Centre } from '@app/domain/centres';
import { CentreStoreActions, CentreStoreReducer, NgrxRuntimeChecks, RootStoreState } from '@app/root-store';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { cold } from 'jasmine-marbles';
import { of } from 'rxjs';
import { CentreShipmentsPageComponent } from './centre-shipments-page.component';

describe('CentreShipmentsComponent', () => {
  let component: CentreShipmentsPageComponent;
  let fixture: ComponentFixture<CentreShipmentsPageComponent>;
  let store: Store<RootStoreState.State>;
  const factory = new Factory();
  let centre: Centre;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({ centre: CentreStoreReducer.reducer }, NgrxRuntimeChecks)
      ],
      providers: [
        NgbActiveModal,
        {
          provide: ActivatedRoute,
          useValue: {}
        },
        {
          provide: Router,
          useValue: {}
        }
      ],
      declarations: [CentreShipmentsPageComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    centre = new Centre().deserialize(factory.centre());
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(CentreShipmentsPageComponent);
    component = fixture.componentInstance;

    updateRouter(centre);
    updateActivatedRoute(centre);
    store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('retrieves the centre from the store', () => {
    fixture.detectChanges();
    expect(component.centre$).toBeObservable(cold('a', { a: centre }));
  });

  it("active tab is initialized from router's event", () => {
    fixture.detectChanges();
    expect(component.activeTabId).toBe('outgoing');
  });

  it('selecting a tab causes a state navigation', () => {
    fixture.detectChanges();
    const router = TestBed.get(Router);
    const event = { activeId: 'outgoing', nextId: 'completed', preventDefault: () => {} };
    component.tabSelection(event);
    fixture.detectChanges();

    expect(router.navigate.mock.calls.length).toBe(1);
    expect(router.navigate.mock.calls[0][0]).toEqual(['/shipping', centre.slug, 'completed']);
  });

  function updateRouter(centre: Centre) {
    const router = TestBed.get(Router);
    router.url = `shipping/${centre.slug}/incoming`;
    router.events = of(
      new NavigationEnd(0, `/shipping/${centre.slug}/outgoing`, `/shipping/${centre.slug}/outgoing`)
    );
    router.navigate = jest.fn();
  }

  function updateActivatedRoute(centre: Centre) {
    TestBed.get(ActivatedRoute).snapshot = { params: { slug: centre.slug } };
  }
});
