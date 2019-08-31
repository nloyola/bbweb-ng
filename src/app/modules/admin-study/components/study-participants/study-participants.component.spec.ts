import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study, StudyState } from '@app/domain/studies';
import { RootStoreState, StudyStoreActions, StudyStoreReducer, NgrxRuntimeChecks } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { NgbActiveModal, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { StudyParticipantsComponent } from './study-participants.component';

describe('StudyParticipantsComponent', () => {
  let component: StudyParticipantsComponent;
  let fixture: ComponentFixture<StudyParticipantsComponent>;
  let ngZone: NgZone;
  let router: Router;
  let store: Store<RootStoreState.State>;
  let modalService: NgbModal;
  let factory: Factory;
  let study: Study;
  let toastr: ToastrService;

  beforeEach(async(() => {
    factory = new Factory();
    study = new Study().deserialize(factory.study({ annotationTypes: [factory.annotationType()] }));

    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            spinner: SpinnerStoreReducer.reducer,
            study: StudyStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        NgbActiveModal,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              parent: {
                snapshot: {
                  data: {
                    study: study
                  },
                  params: {
                    slug: study.slug
                  }
                }
              }
            },
            snapshot: {}
          }
        }
      ],
      declarations: [
        StudyParticipantsComponent,
        AnnotationTypeViewComponent,
        AnnotationTypeRemoveComponent,
        YesNoPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    // https://github.com/angular/angular/issues/12079
    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [AnnotationTypeViewComponent, AnnotationTypeRemoveComponent]
      }
    });
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    router = TestBed.get(Router);
    store = TestBed.get(Store);
    modalService = TestBed.get(NgbModal);
    toastr = TestBed.get(ToastrService);

    fixture = TestBed.createComponent(StudyParticipantsComponent);
    component = fixture.componentInstance;
    ngZone.run(() => router.initialNavigation());
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should change state', () => {
    const spy = jest.spyOn(router, 'navigate');
    const annotationType = study.annotationTypes[0];

    const testData = [
      {
        componentFunc: component => component.add(),
        relativePath: 'add'
      },
      {
        componentFunc: component => component.edit(annotationType),
        relativePath: `../${annotationType.id}`
      }
    ];

    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    fixture.detectChanges();

    testData.forEach((testInfo, index) => {
      ngZone.run(() => testInfo.componentFunc(component));
      fixture.detectChanges();
      expect(spy.mock.calls[index][0]).toEqual([testInfo.relativePath]);
    });
  });

  it('should open a modal', () => {
    const spy = jest.spyOn(modalService, 'open');
    const annotationType = study.annotationTypes[0];

    const testData = [
      { componentFunc: () => component.view(annotationType) },
      { componentFunc: () => component.remove(annotationType) }
    ];

    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    fixture.detectChanges();

    testData.forEach(testInfo => {
      testInfo.componentFunc();
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    });
  });

  it('should throw an error when study is not disabled', () => {
    study = new Study().deserialize({
      ...(study as any),
      state: StudyState.Enabled
    });
    jest.spyOn(modalService, 'open');
    const annotationType = study.annotationTypes[0];

    const testData = [
      { componentFunc: () => component.add() },
      { componentFunc: () => component.edit(annotationType) },
      { componentFunc: () => component.remove(annotationType) }
    ];

    fixture.detectChanges();
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    fixture.detectChanges();

    testData.forEach(testInfo => {
      expect(() => testInfo.componentFunc()).toThrowError('modifications not allowed');
    });
  });

  describe('when removing an annotation', () => {
    it('on valid removal', fakeAsync(() => {
      const studyNoAnnotations = new Study().deserialize({
        ...(study as any),
        annotationTypes: []
      });
      const annotationType = study.annotationTypes[0];

      const storeListner = jest.spyOn(store, 'dispatch');
      jest.spyOn(toastr, 'success').mockReturnValue(null);
      jest.spyOn(modalService, 'open').mockReturnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      } as any);

      store.dispatch(StudyStoreActions.getStudySuccess({ study }));
      fixture.detectChanges();
      component.remove(annotationType);

      tick(1000);
      const expectedAction = StudyStoreActions.updateStudyRemoveAnnotationTypeRequest({
        study,
        annotationTypeId: annotationType.id
      });
      expect(storeListner.mock.calls.length).toBe(2);
      expect(storeListner.mock.calls[1][0]).toEqual(expectedAction);
      store.dispatch(StudyStoreActions.updateStudySuccess({ study: studyNoAnnotations }));

      tick(1000);
      fixture.detectChanges();
      expect(toastr.success).toHaveBeenCalled();
    }));

    it('on submission failure', fakeAsync(() => {
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

      jest.spyOn(modalService, 'open').mockReturnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      } as any);
      jest.spyOn(toastr, 'error').mockReturnValue(null);

      store.dispatch(StudyStoreActions.getStudySuccess({ study }));
      fixture.detectChanges();

      errors.forEach(error => {
        component.remove(study.annotationTypes[0]);
        flush();
        fixture.detectChanges();

        store.dispatch(StudyStoreActions.updateStudyFailure({ error }));
        flush();
        fixture.detectChanges();
        expect(toastr.error).toHaveBeenCalled();
      });
    }));
  });
});
