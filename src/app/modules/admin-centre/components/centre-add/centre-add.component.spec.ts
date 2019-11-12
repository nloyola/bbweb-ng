import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Centre } from '@app/domain/centres';
import { RootStoreState, NgrxRuntimeChecks } from '@app/root-store';
import { CentreStoreActions, CentreStoreReducer } from '@app/root-store/centre';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CentreAddComponent } from './centre-add.component';

describe('CentreAddComponent', () => {
  let component: CentreAddComponent;
  let fixture: ComponentFixture<CentreAddComponent>;
  let store: Store<RootStoreState.State>;
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
        StoreModule.forRoot(
          {
            centre: CentreStoreReducer.reducer
          },
          NgrxRuntimeChecks
        ),
        ToastrModule.forRoot()
      ],
      declarations: [CentreAddComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    ngZone = TestBed.get(NgZone);
    router = TestBed.get(Router);
    toastr = TestBed.get(ToastrService);

    fixture = TestBed.createComponent(CentreAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
      component.name.setValue('centrename');
      const errors = component.name.errors || {};
      expect(errors).toEqual({});
    });
  });

  describe('when submitting', () => {
    it('on valid submission', fakeAsync(() => {
      const centre = new Centre().deserialize(factory.centre());
      spyOn(toastr, 'success').and.returnValue(null);
      const storeListener = jest.spyOn(store, 'dispatch');
      const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.name.setValue(centre.name);
      component.description.setValue(centre.description);
      component.onSubmit();

      const expectedAction = CentreStoreActions.addCentreRequest({
        centre: new Centre().deserialize({
          name: centre.name,
          description: centre.description
        } as any)
      });

      expect(storeListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls[0][0]).toEqual(expectedAction);

      const action = CentreStoreActions.addCentreSuccess({ centre });
      store.dispatch(action);
      fixture.detectChanges();
      flush();

      expect(toastr.success).toHaveBeenCalled();
      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual(['..', centre.slug]);
    }));

    it('on submission failure', fakeAsync(() => {
      const centre = new Centre().deserialize(factory.centre());
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
        component.name.setValue(centre.name);
        component.description.setValue(centre.description);
        component.onSubmit();

        const action = CentreStoreActions.addCentreFailure({ error } as any);
        store.dispatch(action);
        flush();
        fixture.detectChanges();
        expect(toastr.error).toHaveBeenCalled();
      });
    }));
  });

  it('on cancel', () => {
    spyOn(router, 'navigate').and.callThrough();
    ngZone.run(() => component.onCancel());
    expect(router.navigate).toHaveBeenCalled();
    expect((router.navigate as any).calls.mostRecent().args[0]).toEqual(['../']);
  });
});
