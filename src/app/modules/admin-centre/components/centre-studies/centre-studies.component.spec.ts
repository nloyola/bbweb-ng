import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { SearchParams } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { Study, StudyState, StudyStateInfo, StudyStateUIMap } from '@app/domain/studies';
import {
  CentreStoreActions,
  CentreStoreReducer,
  RootStoreState,
  StudyStoreActions,
  NgrxRuntimeChecks
} from '@app/root-store';
import {
  NgbModal,
  NgbModule,
  NgbTypeaheadModule,
  NgbTypeaheadSelectItemEvent
} from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CentreStudiesComponent } from './centre-studies.component';

describe('CentreStudiesComponent', () => {
  let component: CentreStudiesComponent;
  let fixture: ComponentFixture<CentreStudiesComponent>;
  const mockActivatedRoute = new MockActivatedRoute();
  let store: Store<RootStoreState.State>;
  let toastr: ToastrService;
  const factory = new Factory();
  let centre: Centre;

  beforeEach(async(() => {
    centre = new Centre().deserialize(factory.centre());

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        BrowserDynamicTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NgbTypeaheadModule,
        StoreModule.forRoot(
          {
            centre: CentreStoreReducer.reducer
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
      declarations: [CentreStudiesComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    toastr = TestBed.get(ToastrService);

    fixture = TestBed.createComponent(CentreStudiesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    createMockActivatedRouteSpies(centre);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  xit('dispatches an event when user types a study name', fakeAsync(() => {
    // TODO: cannot get this test to work - 2019-02-22
    createMockActivatedRouteSpies(centre);
    store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
    fixture.detectChanges();

    const storeListener = jest.spyOn(store, 'dispatch');
    const inputElem = fixture.debugElement.query(By.css('input'));
    inputElem.nativeElement.value = 'test';
    inputElem.nativeElement.dispatchEvent(new Event('input'));
    flush();
    fixture.detectChanges();

    expect(storeListener.mock.calls.length).toBe(1);
    expect(storeListener.mock.calls[0][0]).toEqual(
      StudyStoreActions.searchStudiesRequest({
        searchParams: {} as SearchParams
      })
    );
  }));

  it('study state label is valid', () => {
    createMockActivatedRouteSpies(centre);
    store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
    fixture.detectChanges();

    Object.values(StudyState).forEach(state => {
      const study = new Study().deserialize({
        ...factory.study(),
        state
      });

      const studyName = new StudyStateInfo().deserialize(factory.entityNameAndStateDto(study));
      expect(component.studyStateLabel(studyName)).toBe(StudyStateUIMap.get(study.state).stateLabel);
    });
  });

  it('selecting a study dispatches an event', () => {
    createMockActivatedRouteSpies(centre);
    store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
    fixture.detectChanges();

    const study = new Study().deserialize(factory.study());
    const storeListener = jest.spyOn(store, 'dispatch');

    component.studyAddTypeahead.onEntitySelected({ item: { id: study.id } } as NgbTypeaheadSelectItemEvent);

    expect(storeListener.mock.calls.length).toBe(1);
    expect(storeListener.mock.calls[0][0]).toEqual(
      CentreStoreActions.updateCentreRequest({
        centre,
        attributeName: 'studyAdd',
        value: study.id
      })
    );
  });

  describe('when removing a study', () => {
    let study: Study;

    beforeEach(() => {
      study = new Study().deserialize(factory.study());

      const modalService = TestBed.get(NgbModal);
      spyOn(modalService, 'open').and.returnValue({
        componentInstance: {},
        result: Promise.resolve({ confirmed: true })
      });
    });

    it('dispatches an event', async(() => {
      createMockActivatedRouteSpies(centre);
      store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
      fixture.detectChanges();

      const storeListener = jest.spyOn(store, 'dispatch');
      component.remove(study);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(storeListener.mock.calls.length).toBe(1);
        expect(storeListener.mock.calls[0][0]).toEqual(
          CentreStoreActions.updateCentreRequest({
            centre,
            attributeName: 'studyRemove',
            value: study.id
          })
        );
      });
    }));

    it('notifies the user on success', fakeAsync(() => {
      const toastrListener = jest.spyOn(toastr, 'success');

      createMockActivatedRouteSpies(centre);
      store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
      flush();
      fixture.detectChanges();

      component.remove(study);
      flush();
      fixture.detectChanges();

      store.dispatch(CentreStoreActions.updateCentreSuccess({ centre }));
      flush();
      fixture.detectChanges();
      expect(toastrListener.mock.calls.length).toBe(1);
    }));

    it('notifies the user on failure', fakeAsync(() => {
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
      const toastrListener = jest.spyOn(toastr, 'error');

      createMockActivatedRouteSpies(centre);
      store.dispatch(CentreStoreActions.getCentreSuccess({ centre }));
      flush();
      fixture.detectChanges();

      component.remove(study);
      flush();
      fixture.detectChanges();

      errors.forEach((error, index) => {
        store.dispatch(CentreStoreActions.updateCentreFailure({ error }));
        flush();
        fixture.detectChanges();
        expect(toastrListener.mock.calls.length).toBe(index + 1);
      });
    }));
  });

  function createMockActivatedRouteSpies(c: Centre): void {
    mockActivatedRoute.spyOnParent(() => ({
      snapshot: {
        data: {
          centre: c
        },
        params: {
          slug: c.slug
        }
      }
    }));
  }
});
