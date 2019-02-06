import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study, StudyState } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { AnnotationTypeRemoveComponent } from '@app/shared/components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from '@app/shared/components/annotation-type-view/annotation-type-view.component';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { Factory } from '@app/test/factory';
import { NgbActiveModal, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { StudyParticipantsComponent } from './study-participants.component';


describe('StudyParticipantsComponent', () => {

  let component: StudyParticipantsComponent;
  let fixture: ComponentFixture<StudyParticipantsComponent>;
  let ngZone: NgZone;
  let router: Router;
  let store: Store<StudyStoreReducer.State>;
  let modalService: NgbModal;
  let factory: Factory;
  let study: Study;
  let toastr: ToastrService;

  beforeEach(async(() => {
    factory = new Factory();
    study = new Study().deserialize(factory.study({ annotationTypes: [ factory.annotationType() ]} ));

    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'spinner': SpinnerStoreReducer.reducer,
          'study': StudyStoreReducer.reducer
        }),
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
        entryComponents: [
          AnnotationTypeViewComponent,
          AnnotationTypeRemoveComponent
        ]
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

  it('assigns the study when updated', () => {
    fixture.detectChanges();
    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
    fixture.detectChanges();
    expect(component.study).toEqual(new StudyUI(study));
  });

  it('should change state', () => {
    const spy = jest.spyOn(router, 'navigate');
    const annotationType = study.annotationTypes[0];

    /* tslint:disable:no-shadowed-variable */
    const testData = [
      {
        componentFunc: (component) => component.add(),
        relativePath: 'add'
      },
      {
        componentFunc: (component) => component.edit(annotationType),
        relativePath: `../${annotationType.id}`
      }
    ];
    /* tslint:enable:no-shadowed-variable */

    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
    fixture.detectChanges();

    testData.forEach((testInfo, index) => {
      ngZone.run(() => testInfo.componentFunc(component));
      fixture.detectChanges();
      expect(spy.mock.calls[index][0]).toEqual([ testInfo.relativePath ]);
    });
  });

  it('should open a modal', () => {
    const spy = jest.spyOn(modalService, 'open');
    const annotationType = study.annotationTypes[0];

    /* tslint:disable:no-shadowed-variable */
    const testData = [
      {
        componentFunc: (component) => component.view(annotationType),
      },
      {
        componentFunc: (component) => component.remove(annotationType),
      }
    ];
    /* tslint:enable:no-shadowed-variable */

    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
    fixture.detectChanges();

    testData.forEach((testInfo, index) => {
      testInfo.componentFunc(component);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    });

  });

  it('should throw an error when study is not disabled', () => {
    study = new Study().deserialize({
      ...study,
      state: StudyState.Enabled
    });
    jest.spyOn(modalService, 'open');
    const annotationType = study.annotationTypes[0];

    /* tslint:disable:no-shadowed-variable */
    const testData = [
      { componentFunc: (component) => component.add(annotationType) },
      { componentFunc: (component) => component.edit(annotationType) },
      { componentFunc: (component) => component.remove(annotationType) }
    ];
    /* tslint:enable:no-shadowed-variable */

    fixture.detectChanges();
    store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
    fixture.detectChanges();

    testData.forEach(testInfo => {
      expect(() => testInfo.componentFunc(component)).toThrowError('modifications not allowed');
    });
  });

  describe('when removing an annotation', () => {

    it('on valid removal', fakeAsync(() => {
      const studyNoAnnotations = new Study().deserialize({
        ...study,
        annotationTypes: []
      });
      const annotationType = study.annotationTypes[0];

      const storeListner = jest.spyOn(store, 'dispatch');
      const toastrListner = jest.spyOn(toastr, 'success').mockReturnValue(null);
      const modalListner = jest.spyOn(modalService, 'open').mockReturnValue({
        componentInstance: {},
        result: Promise.resolve('OK')
      });

      store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
      fixture.detectChanges();
      component.remove(annotationType);

      tick(1000);
      const expectedAction = new StudyStoreActions.UpdateStudyRemoveAnnotationTypeRequest({
        study,
        annotationTypeId: annotationType.id
      });
      expect(storeListner.mock.calls.length).toBe(2);
      expect(storeListner.mock.calls[1][0]).toEqual(expectedAction);
      store.dispatch(new StudyStoreActions.UpdateStudySuccess({ study: studyNoAnnotations }));

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
      });
      jest.spyOn(toastr, 'error').mockReturnValue(null);

      store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
      fixture.detectChanges();

      errors.forEach(error => {
        component.remove(study.annotationTypes[0]);

        tick(1000);
        fixture.detectChanges();
        expect(component.updatedMessage).toBe('Annotation removed');
        store.dispatch(new StudyStoreActions.UpdateStudyFailure({ error }));

        tick(1000);
        fixture.detectChanges();
        expect(toastr.error).toHaveBeenCalled();
      });
    }));
  });

});
