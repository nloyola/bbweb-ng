import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Membership } from '@app/domain/access';
import { MembershipStoreActions, MembershipStoreReducer, NgrxRuntimeChecks, RootStoreState } from '@app/root-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MembershipAddComponent } from './membership-add.component';

describe('MembershipAddComponent', () => {
  let component: MembershipAddComponent;
  let fixture: ComponentFixture<MembershipAddComponent>;
  let store: Store<RootStoreState.State>;
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
            'membership': MembershipStoreReducer.reducer,
            'spinner': SpinnerStoreReducer.reducer
          },
          NgrxRuntimeChecks),
        ToastrModule.forRoot()
      ],
      declarations: [ MembershipAddComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    toastr = TestBed.get(ToastrService);

    fixture = TestBed.createComponent(MembershipAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
      component.name.setValue('membershipname');
      const errors = component.name.errors || {};
      expect(errors).toEqual({});
    });

  });

  describe('when submitting', () => {

    it('on valid submission', fakeAsync(() => {
      const membership = new Membership().deserialize(factory.membership());
      spyOn(toastr, 'success').and.returnValue(null);
      const storeListener = jest.spyOn(store, 'dispatch');
      const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component.name.setValue(membership.name);
      component.description.setValue(membership.description);
      component.onSubmit();

      const expectedAction = new MembershipStoreActions.AddMembershipRequest({
        membership: new Membership().deserialize({
          name: membership.name,
          description: membership.description
        } as any)
      });

      expect(storeListener.mock.calls.length).toBe(1);
      expect(storeListener.mock.calls[0][0]).toEqual(expectedAction);

      const action = new MembershipStoreActions.AddMembershipSuccess({ membership });
      store.dispatch(action);
      fixture.detectChanges();
      flush();

      expect(toastr.success).toHaveBeenCalled();
      expect(routerListener.mock.calls.length).toBe(1);
      expect(routerListener.mock.calls[0][0]).toEqual(['../', membership.slug]);
    }));

    it('on submission failure', fakeAsync(() => {
      const membership = new Membership().deserialize(factory.membership());
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

      const toastrErrorListener = jest.spyOn(toastr, 'error').mockReturnValue(null);

      errors.forEach(error => {
        toastrErrorListener.mockClear();
        component.name.setValue(membership.name);
        component.description.setValue(membership.description);
        component.onSubmit();

        store.dispatch(new MembershipStoreActions.AddMembershipFailure({ error } as any ));
        flush();
        fixture.detectChanges();
        expect(toastrErrorListener.mock.calls.length).toBe(1);
      });
    }));

  });

  it('on cancel', () => {
    const routerListener = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onCancel();
    expect(router.navigate).toHaveBeenCalled();
    expect(routerListener.mock.calls.length).toBe(1);
    expect(routerListener.mock.calls[0][0]).toEqual(['../']);
  });

});
