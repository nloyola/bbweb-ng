import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { NgrxRuntimeChecks, RootStoreState, StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { AnnotationTypeAddComponent } from '@app/shared/components/annotation-type-add/annotation-type-add.component';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';
import { cold } from 'jasmine-marbles';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ParticipantAnnotationTypeAddContainerComponent } from './participant-annotation-type-add.container';

describe('ParticipantAnnotationTypeAddContainer', () => {
  let component: ParticipantAnnotationTypeAddContainerComponent;
  let fixture: ComponentFixture<ParticipantAnnotationTypeAddContainerComponent>;
  let ngZone: NgZone;
  let router: Router;
  const mockActivatedRoute = new MockActivatedRoute();
  let store: Store<RootStoreState.State>;
  let toastr: ToastrService;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            study: StudyStoreReducer.reducer
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
      declarations: [AnnotationTypeAddComponent, ParticipantAnnotationTypeAddContainerComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    toastr = TestBed.get(ToastrService);

    fixture = TestBed.createComponent(ParticipantAnnotationTypeAddContainerComponent);
    component = fixture.componentInstance;
    ngZone.run(() => router.initialNavigation());
  });

  it('should create', () => {
    const study = createStudy();
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    mockActivatedRouteSnapshot('add', study);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('assigns the study when it is changed in the store', () => {
    const study = createStudy();
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    mockActivatedRouteSnapshot('add', study);

    store.dispatch(StudyStoreActions.getStudySuccess({ study }));

    fixture.detectChanges();
    expect(component.study).toEqual(study);
  });

  it('returns to the correct state when Cancel button is pressed', () => {
    const study = createStudy();
    const spy = jest.spyOn(router, 'navigate');

    const testData = [{ path: 'add', returnPath: '..' }];

    testData.forEach((testInfo, index) => {
      mockActivatedRouteSnapshot(testInfo.path, study);
      store.dispatch(StudyStoreActions.getStudySuccess({ study }));
      component.ngOnInit();
      fixture.detectChanges();

      ngZone.run(() => component.onCancel());
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[index][0]).toEqual([testInfo.returnPath]);
    });
  });

  describe('when submitting', () => {
    it('on valid submission', async(() => {
      const study = createStudy();
      store.dispatch(StudyStoreActions.getStudySuccess({ study }));
      mockActivatedRouteSnapshot('add', study);
      fixture.detectChanges();

      const expectedAction = StudyStoreActions.updateStudyAddOrUpdateAnnotationTypeRequest({
        study,
        annotationType: study.annotationTypes[0]
      });

      jest.spyOn(store, 'dispatch');
      jest.spyOn(toastr, 'success').mockReturnValue(null);
      const routerListener = jest.spyOn(router, 'navigate');

      component.onSubmit(study.annotationTypes[0]);
      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);

      expect(component.isSaving$).toBeObservable(cold('b', { b: true }));

      ngZone.run(() => store.dispatch(StudyStoreActions.updateStudySuccess({ study })));

      fixture.whenStable().then(() => {
        expect(component.isSaving$).toBeObservable(cold('b', { b: false }));
        expect(store.dispatch).toHaveBeenCalled();
        expect(toastr.success).toHaveBeenCalled();
        expect(routerListener.mock.calls[0][0]).toEqual(['..']);
      });
    }));

    it('on submission failure', async(() => {
      const study = createStudy();
      const testData = [
        { path: 'add', savedMessage: 'Annotation Added' },
        { path: study.annotationTypes[0].id, savedMessage: 'Annotation Updated' }
      ];
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

      jest.spyOn(toastr, 'error').mockReturnValue(null);
      jest.spyOn(router, 'navigate');

      store.dispatch(StudyStoreActions.getStudySuccess({ study }));

      testData.forEach(testInfo => {
        mockActivatedRouteSnapshot(testInfo.path, study);
        component.ngOnInit();
        fixture.detectChanges();

        errors.forEach(error => {
          component.onSubmit(study.annotationTypes[0]);
          expect(component.isSaving$).toBeObservable(cold('b', { b: true }));
          store.dispatch(StudyStoreActions.getStudyFailure({ error }));
          fixture.detectChanges();

          fixture.whenStable().then(() => {
            expect(component.isSaving$).toBeObservable(cold('b', { b: false }));
            expect(toastr.error).toHaveBeenCalled();
            expect(router.navigate).not.toHaveBeenCalled();
          });
        });
      });
    }));
  });

  function createStudy(): Study {
    const annotationType = {
      ...factory.annotationType(),
      id: factory.stringNext()
    };
    return new Study().deserialize(factory.study({ annotationTypes: [annotationType] }));
  }

  function mockActivatedRouteSnapshot(path: string, study: Study): void {
    const annotationTypeId = path === 'add' ? undefined : study.annotationTypes[0].id;
    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        snapshot: {
          data: {
            study
          },
          params: {
            slug: study.slug
          }
        }
      }
    }));

    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {
        slug: study.slug,
        annotationTypeId
      },
      url: [{ path: '' }, { path }]
    }));
  }
});
