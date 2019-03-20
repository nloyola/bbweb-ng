import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { StudyStoreActions, StudyStoreReducer } from '@app/root-store/study';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { StudyAddComponent } from './study-add.component';

describe('StudyAddComponent', () => {

  let store: Store<StudyStoreReducer.State>;
  let component: StudyAddComponent;
  let fixture: ComponentFixture<StudyAddComponent>;
  let ngZone: NgZone;
  let router: Router;
  let toastr: ToastrService;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [StudyAddComponent],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(StudyAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

    it('on valid submission', fakeAsync(() => {
      const study = new Study().deserialize(factory.study());
      spyOn(toastr, 'success').and.returnValue(null);
      const storeListener = jest.spyOn(store, 'dispatch');
      const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.name.setValue(study.name);
      component.description.setValue(study.description);
      component.onSubmit();

      const expectedAction = new StudyStoreActions.AddStudyRequest({
        study: new Study().deserialize({
          name: study.name,
          description: study.description
        })
      });

      expect(storeListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls[0][0]).toEqual(expectedAction);

      const action = new StudyStoreActions.AddStudySuccess({ study });
      store.dispatch(action);
      fixture.detectChanges();
      flush();

      expect(toastr.success).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalled();
      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual(['../', study.slug]);
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
