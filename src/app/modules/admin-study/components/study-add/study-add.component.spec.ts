import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { StudyStoreActions, StudyStoreReducer } from '@app/root-store/study';
import { Factory } from '@app/test/factory';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { StudyAddComponent } from './study-add.component';

describe('StudyAddComponent', () => {

  let store: Store<StudyStoreReducer.State>;
  let actions: Observable<any>;
  let component: StudyAddComponent;
  let fixture: ComponentFixture<StudyAddComponent>;
  let factory: Factory;
  let ngZone: NgZone;
  let router: Router;
  let toastr: ToastrService;

  @Component({ template: 'Test component' })
  class TestComponent { }

  const routes: Routes = [
    {
      path: 'admin/studies',
      component: TestComponent
    },
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes(routes),
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [StudyAddComponent, TestComponent],
      providers: [
        provideMockActions(() => actions)
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(StudyAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    factory = new Factory();
    ngZone = TestBed.get(NgZone);
    router = TestBed.get(Router);
    toastr = TestBed.get(ToastrService);

    ngZone.run(() => router.initialNavigation());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.form.valid).toBeFalsy();
  });

  describe('name input validity', () => {

    it('is required', () => {
      const errors = component.name.errors || {};
      expect(errors['required']).toBeTruthy();
    });

    it('when valid, form is not errored', () => {
      component.name.setValue('studyname');
      const errors = component.name.errors || {};
      expect(errors).toEqual({});
    });

  });

  describe('when submitting', () => {

    it('on valid submission', async(() => {
      const study = new Study().deserialize(factory.study());
      spyOn(store, 'dispatch').and.callThrough();
      spyOn(router, 'navigate').and.callThrough();
      spyOn(toastr, 'success').and.returnValue(null);

      component.name.setValue(study.name);
      component.description.setValue(study.description);
      component.onSubmit();

      const expectedAction = new StudyStoreActions.AddStudyRequest({
        study: new Study().deserialize({
          name: study.name,
          description: study.description
        })
      });

      expect(store.dispatch).toHaveBeenCalledWith(expectedAction);

      ngZone.run(() => {
        const action = new StudyStoreActions.AddStudySuccess({ study });
        store.dispatch(action);
      });

      fixture.whenStable().then(() => {
        expect(toastr.success).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalled();
        expect((router.navigate as any).calls.mostRecent().args[0]).toEqual(['../']);
      });
    }));

    it('on submission failure', async(() => {
      const study = new Study().deserialize(factory.study());
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

      spyOn(toastr, 'error').and.returnValue(null);

      errors.forEach(error => {
        component.name.setValue(study.name);
        component.description.setValue(study.description);
        component.onSubmit();

        const action = new StudyStoreActions.AddStudyFailure({ error: error });
        store.dispatch(action);

        fixture.whenStable().then(() => {
          expect(toastr.error).toHaveBeenCalled();
        });
      });
    }));

  });

  it('on cancel', async(() => {
    spyOn(router, 'navigate').and.callThrough();
    ngZone.run(() => component.onCancel());
    expect(router.navigate).toHaveBeenCalled();
    expect((router.navigate as any).calls.mostRecent().args[0]).toEqual(['../']);
  }));

});
