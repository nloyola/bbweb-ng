import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { StudyStoreActions, StudyStoreReducer, RootStoreState } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { StudySummaryComponent } from './study-summary.component';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import * as faker from 'faker';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';

describe('StudySummaryComponent', () => {
  let component: StudySummaryComponent;
  let fixture: ComponentFixture<StudySummaryComponent>;
  let ngZone: NgZone;
  let store: Store<RootStoreState.State>;
  let router: Router;
  let modalService: NgbModal;
  let factory: Factory;
  let study: Study;

  beforeEach(async(() => {
    factory = new Factory();
    study = new Study().deserialize(factory.study());

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        RouterTestingModule,
        StoreModule.forRoot(
          {
            study: StudyStoreReducer.reducer,
            spinner: SpinnerStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  study: study
                },
                params: {
                  slug: study.slug
                }
              }
            },
            snapshot: {}
          }
        }
      ],
      declarations: [StudySummaryComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    ngZone = TestBed.get(NgZone);
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    modalService = TestBed.get(NgbModal);
    fixture = TestBed.createComponent(StudySummaryComponent);
    component = fixture.componentInstance;
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('navigates to new path when study name is changed', fakeAsync(() => {
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    flush();
    fixture.detectChanges();

    const newNameAndSlug = factory.nameAndSlug();
    const studyWithNewName = new Study().deserialize({
      ...(study as any),
      ...newNameAndSlug
    });

    const routerListener = jest.spyOn(router, 'navigate');
    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newNameAndSlug.name) } as any);
    component.updateName();
    flush();
    fixture.detectChanges();

    ngZone.run(() => store.dispatch(StudyStoreActions.updateStudySuccess({ study: studyWithNewName })));
    flush();
    fixture.detectChanges();

    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual(['../..', studyWithNewName.slug, 'summary']);
  }));

  describe('when updating attributes', () => {
    const context: EntityUpdateComponentBehaviour.Context<StudySummaryComponent> = {} as any;

    beforeEach(() => {
      context.fixture = fixture;
      context.componentInitialize = () => {
        store.dispatch(StudyStoreActions.getStudySuccess({ study }));
        store.dispatch(
          StudyStoreActions.getEnableAllowedSuccess({
            studyId: study.id,
            allowed: true
          })
        );
      };
      context.componentValidateInitialization = () => undefined;
      context.dispatchSuccessAction = () => {
        store.dispatch(StudyStoreActions.updateStudySuccess({ study }));
      };
      context.createExpectedFailureAction = error => StudyStoreActions.updateStudyFailure({ error });
      context.duplicateAttibuteValueError = 'name already used';
    });

    describe('when updating name', () => {
      beforeEach(() => {
        const newName = factory.stringNext();
        context.modalReturnValue = { result: Promise.resolve(newName) };
        context.updateEntity = () => {
          component.updateName();
        };

        const studyWithUpdatedSlug = new Study().deserialize({
          ...(study as any),
          slug: factory.slugify(newName),
          name: newName
        });

        context.expectedSuccessAction = StudyStoreActions.updateStudyRequest({
          study,
          attributeName: 'name',
          value: newName
        });
        context.dispatchSuccessAction = () => {
          store.dispatch(StudyStoreActions.updateStudySuccess({ study: studyWithUpdatedSlug }));
        };
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when updating description', () => {
      beforeEach(() => {
        const newValue = faker.lorem.paragraphs();
        context.modalReturnValue = { result: Promise.resolve(newValue) };
        context.updateEntity = () => {
          component.updateDescription();
        };

        context.expectedSuccessAction = StudyStoreActions.updateStudyRequest({
          study,
          attributeName: 'description',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when DISABLING a study', () => {
      beforeEach(() => {
        const newValue = 'disable';
        context.updateEntity = () => {
          component.disable();
        };
        context.expectedSuccessAction = StudyStoreActions.updateStudyRequest({
          study,
          attributeName: 'state',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when ENABLING a study', () => {
      beforeEach(() => {
        const newValue = 'enable';
        context.updateEntity = () => {
          component.enable();
        };
        context.expectedSuccessAction = StudyStoreActions.updateStudyRequest({
          study,
          attributeName: 'state',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when RETIRING a study', () => {
      beforeEach(() => {
        const newValue = 'retire';
        context.updateEntity = () => {
          component.retire();
        };
        context.expectedSuccessAction = StudyStoreActions.updateStudyRequest({
          study,
          attributeName: 'state',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });

    describe('when UNRETIRING a study', () => {
      beforeEach(() => {
        const newValue = 'unretire';
        context.updateEntity = () => {
          component.unretire();
        };
        context.expectedSuccessAction = StudyStoreActions.updateStudyRequest({
          study,
          attributeName: 'state',
          value: newValue
        });
      });

      EntityUpdateComponentBehaviour.sharedBehaviour(context);
    });
  });

  describe('common behaviour', () => {
    it('functions should open a modal', fakeAsync(() => {
      const testData = [
        {
          componentFunc: c => c.updateName(),
          attribute: 'name',
          value: 'test'
        },
        {
          componentFunc: c => c.updateDescription(),
          attribute: 'description',
          value: 'test'
        }
      ];

      const storeListener = jest.spyOn(store, 'dispatch');
      const modalListener = jest.spyOn(modalService, 'open');

      ngZone.run(() => store.dispatch(StudyStoreActions.getStudySuccess({ study })));
      fixture.detectChanges();

      storeListener.mockClear();
      testData.forEach((testInfo, index) => {
        modalListener.mockReturnValue({
          componentInstance: {},
          result: Promise.resolve(testInfo.value)
        } as any);

        testInfo.componentFunc(component);
        fixture.detectChanges();
        tick(1000);

        expect(storeListener.mock.calls.length).toBe(index + 1);
        expect(storeListener.mock.calls[index][0]).toEqual(
          StudyStoreActions.updateStudyRequest({
            study,
            attributeName: testInfo.attribute,
            value: testInfo.value
          })
        );
      });
      expect(modalListener.mock.calls.length).toBe(testData.length);
    }));

    it('functions that should notify the user', fakeAsync(() => {
      const toastr = TestBed.get(ToastrService);

      jest.spyOn(toastr, 'success').mockReturnValue(null);
      jest.spyOn(store, 'dispatch');
      jest.spyOn(modalService, 'open').mockReturnValue({
        componentInstance: {},
        result: Promise.resolve('test')
      } as any);

      ngZone.run(() => store.dispatch(StudyStoreActions.getStudySuccess({ study })));
      fixture.detectChanges();

      const componentUpdateFuncs = [
        () => component.updateName(),
        () => component.updateDescription(),
        () => component.disable(),
        () => {
          store.dispatch(
            StudyStoreActions.getEnableAllowedSuccess({
              studyId: study.id,
              allowed: true
            })
          );
          fixture.detectChanges();
          component.enable();
        },
        () => component.retire(),
        () => component.unretire()
      ];

      componentUpdateFuncs.forEach(updateFunc => {
        updateFunc();
        fixture.detectChanges();
        flush();
        expect(store.dispatch).toHaveBeenCalled();
        ngZone.run(() => store.dispatch(StudyStoreActions.updateStudySuccess({ study })));
        flush();
      });

      flush();
      expect(toastr.success.mock.calls.length).toBe(componentUpdateFuncs.length);
    }));

    it('functions that change the study state', fakeAsync(() => {
      ngZone.run(() => {
        store.dispatch(StudyStoreActions.getStudySuccess({ study }));
        store.dispatch(
          StudyStoreActions.getEnableAllowedSuccess({
            studyId: study.id,
            allowed: true
          })
        );
      });
      fixture.detectChanges();

      const testData = [
        { componentFunc: () => component.disable(), value: 'disable' },
        { componentFunc: () => component.enable(), value: 'enable' },
        { componentFunc: () => component.retire(), value: 'retire' },
        { componentFunc: () => component.unretire(), value: 'unretire' }
      ];

      const storeListener = jest.spyOn(store, 'dispatch');
      testData.forEach((testInfo, index) => {
        testInfo.componentFunc();
        fixture.detectChanges();
        flush();

        expect(storeListener.mock.calls.length).toBe(1 + index);
        expect(storeListener.mock.calls[index][0]).toEqual(
          StudyStoreActions.updateStudyRequest({
            study,
            attributeName: 'state',
            value: testInfo.value
          })
        );
      });
    }));
  });
});
