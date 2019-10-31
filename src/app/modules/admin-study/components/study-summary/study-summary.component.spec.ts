import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study, StudyState } from '@app/domain/studies';
import { RootStoreState, StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { NgrxRuntimeChecks } from '@app/root-store/root-store.module';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { EntityUpdateComponentBehaviour } from '@test/behaviours/entity-update-component.behaviour';
import { Factory } from '@test/factory';
import { TestUtils } from '@test/utils';
import * as faker from 'faker';
import { ToastrModule } from 'ngx-toastr';
import { StudySummaryComponent } from './study-summary.component';
import { DropdownMenuSelectableItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';

describe('StudySummaryComponent', () => {
  let component: StudySummaryComponent;
  let fixture: ComponentFixture<StudySummaryComponent>;
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
        ReactiveFormsModule,
        NgbModule,
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
    dispatchSetupActions();
    flush();
    fixture.detectChanges();

    const navigateListener = TestUtils.routerNavigateListener();
    const newNameAndSlug = factory.nameAndSlug();
    const studyWithNewName = new Study().deserialize({
      ...(study as any),
      ...newNameAndSlug
    });

    jest.spyOn(modalService, 'open').mockReturnValue({ result: Promise.resolve(newNameAndSlug.name) } as any);
    component.updateName();
    flush();
    fixture.detectChanges();

    store.dispatch(StudyStoreActions.updateStudySuccess({ study: studyWithNewName }));
    flush();
    fixture.detectChanges();

    expect(navigateListener.mock.calls.length).toBe(1);
    expect(navigateListener.mock.calls[0][0]).toEqual(['../..', studyWithNewName.slug, 'summary']);
  }));

  describe('when updating attributes', () => {
    const context: EntityUpdateComponentBehaviour.Context<StudySummaryComponent> = {} as any;

    beforeEach(() => {
      context.fixture = fixture;
      context.componentInitialize = () => dispatchSetupActions();
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

  const menuItemData = [
    ['Update Name', 'updateName', StudyState.Disabled],
    ['Update Description', 'updateDescription', StudyState.Disabled],
    ['Disable this Study', 'disable', StudyState.Enabled],
    ['Enable this Study', 'enable', StudyState.Disabled],
    ['Retire this Study', 'retire', StudyState.Disabled],
    ['Unretire this Study', 'unretire', StudyState.Retired]
  ];

  describe.each(menuItemData)(
    'menu item "%s" invokes %s when study is %s',
    (itemLabel, componentMethodName, state) => {
      it("menu item emits inokes the component's method", fakeAsync(() => {
        study = new Study().deserialize({
          ...(study as any),
          state
        });
        dispatchSetupActions();
        flush();
        fixture.detectChanges();

        expect(component[componentMethodName]).toBeFunction();
        component[componentMethodName] = jest.fn();

        const menuItem = component.menuItems.find(mi => mi.kind === 'selectable' && mi.label == itemLabel);
        const selectableMenuItem = menuItem as DropdownMenuSelectableItem;
        expect(selectableMenuItem).toBeDefined();
        expect(selectableMenuItem.onSelected).toBeFunction();
        selectableMenuItem.onSelected();
        expect(component[componentMethodName].mock.calls.length).toBe(1);
      }));
    }
  );

  function dispatchSetupActions(): void {
    store.dispatch(StudyStoreActions.getStudySuccess({ study }));
    store.dispatch(
      StudyStoreActions.getEnableAllowedSuccess({
        studyId: study.id,
        allowed: true
      })
    );
  }
});
