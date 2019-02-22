import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute } from '@angular/router';
import { Centre } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { CentreStoreActions, CentreStoreReducer, StudyStoreReducer, StudyStoreActions } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { NgbModule, NgbTypeahead, NgbTypeaheadSelectItemEvent, NgbModal, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CentreStudiesComponent } from './centre-studies.component';
import { StudyStateUIMap, StudyState, Study } from '@app/domain/studies';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { SearchParams } from '@app/domain';

describe('CentreStudiesComponent', () => {
  let component: CentreStudiesComponent;
  let fixture: ComponentFixture<CentreStudiesComponent>;
  const mockActivatedRoute = new MockActivatedRoute();
  let store: Store<StudyStoreReducer.State>;
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
        StoreModule.forRoot({
          'centre': CentreStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [ CentreStudiesComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
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

  it('assigns the centre when it is added to the store', () => {
    createMockActivatedRouteSpies(centre);
    store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre }));
    fixture.detectChanges();
    expect(component.centre).toEqual(new CentreUI(centre));
  });

  xit('dispatches an event when user types a study name', fakeAsync(() => {
    // TODO: cannot get this test to work - 2019-02-22
    createMockActivatedRouteSpies(centre);
    store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre }));
    fixture.detectChanges();

    debugger;
    const storeListener = jest.spyOn(store, 'dispatch');
    const inputElem = fixture.debugElement.query(By.css('input'));
    inputElem.nativeElement.value = 'test';
    inputElem.nativeElement.dispatchEvent(new Event('input'));
    flush();
    fixture.detectChanges();

    expect(storeListener.mock.calls.length).toBe(1);
    expect(storeListener.mock.calls[0][0]).toEqual(
      new StudyStoreActions.SearchStudiesRequest({
        searchParams: {} as SearchParams
      }));
  }));

  it('study state label is valid', () => {
    createMockActivatedRouteSpies(centre);
    store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre }));
    fixture.detectChanges();

    Object.values(StudyState).forEach(state => {
      const study = new Study().deserialize({
        ...factory.study(),
        state
      });
      const studyName = factory.entityNameAndStateDto(study);
      expect(component.studyStateLabel(studyName)).toBe(StudyStateUIMap.get(study.state).stateLabel)
    });
  });

  it('selecting a study dispatches an event', () => {
    createMockActivatedRouteSpies(centre);
    store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre }));
    fixture.detectChanges();

    const study = new Study().deserialize(factory.study());
    const storeListener = jest.spyOn(store, 'dispatch');
    component.selectedItem({ item: { id: study.id }} as NgbTypeaheadSelectItemEvent);
    expect(storeListener.mock.calls.length).toBe(1);
    expect(storeListener.mock.calls[0][0]).toEqual(
      new CentreStoreActions.UpdateCentreAddStudyRequest({
        centre,
        studyId: study.id
      }));
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
      store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre }));
      fixture.detectChanges();

      const storeListener = jest.spyOn(store, 'dispatch');
      component.remove(study);
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        fixture.detectChanges();

        expect(storeListener.mock.calls.length).toBe(1);
        expect(storeListener.mock.calls[0][0]).toEqual(
          new CentreStoreActions.UpdateCentreRemoveStudyRequest({
            centre,
            studyId: study.id
          }));
      });
    }));

    it('notifies the user', fakeAsync(() => {
      const toastrListener = jest.spyOn(toastr, 'success');

      createMockActivatedRouteSpies(centre);
      store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre }));
      flush();
      fixture.detectChanges();

      component.remove(study);
      flush();
      fixture.detectChanges();

      store.dispatch(new CentreStoreActions.UpdateCentreSuccess({ centre }));
      flush();
      fixture.detectChanges();
      expect(toastrListener.mock.calls.length).toBe(1);
    }));

    it('notifies the user', fakeAsync(() => {
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
      const toastrListener = jest.spyOn(toastr, 'error');

      createMockActivatedRouteSpies(centre);
      store.dispatch(new CentreStoreActions.GetCentreSuccess({ centre }));
      flush();
      fixture.detectChanges();

      component.remove(study);
      flush();
      fixture.detectChanges();

      errors.forEach((error, index) => {
        store.dispatch(new CentreStoreActions.UpdateCentreFailure({ error }));
        flush();
        fixture.detectChanges();
        expect(toastrListener.mock.calls.length).toBe(index + 1);
      });
    }));
  });

  function createMockActivatedRouteSpies(centre: Centre): void {
    mockActivatedRoute.spyOnParent(() => ({
      snapshot: {
        data: {
          centre
        },
        params: {
          slug: centre.slug
        }
      }
    }));
  }
});
