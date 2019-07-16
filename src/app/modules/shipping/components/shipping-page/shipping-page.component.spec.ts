import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ShippingPageComponent } from './shipping-page.component';
import { Store, StoreModule } from '@ngrx/store';
import { RootStoreState, AuthStoreActions, StudyStoreActions, CentreStoreReducer, AuthStoreReducer, NgrxRuntimeChecks, CentreStoreActions } from '@app/root-store';
import { Factory } from '@test/factory';
import { User } from '@app/domain/users';
import { Study, StudyStateInfo, StudyState } from '@app/domain/studies';
import { Participant } from '@app/domain/participants';
import { By } from '@angular/platform-browser';
import { Centre } from '@app/domain/centres';
import { RoleIds } from '@app/domain/access';
import { PagedReply } from '../../../../domain/paged-reply.model';

interface EntitiesOptions {
  user?: User;
  centre?: Centre;
}

describe('ShippingComponent', () => {
  let component: ShippingPageComponent;
  let fixture: ComponentFixture<ShippingPageComponent>;
  let store: Store<RootStoreState.State>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        StoreModule.forRoot(
          {
            'centre': CentreStoreReducer.reducer,
            'auth': AuthStoreReducer.reducer
          },
          NgrxRuntimeChecks
        )
      ],
      declarations: [ShippingPageComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShippingPageComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('when loading', () => {

    it('should show loading', () => {
      const user = new User().deserialize(factory.user());
      const entities = createEntities({ user });
      store.dispatch(AuthStoreActions.loginSuccessAction({ user }));

      expect('loading').toBeTruthy();
    });

    it('on invalid user should show invalidUser template', () => {
      const user = new User().deserialize(factory.user({
        roles: []
      }));
      const entities = createEntities({ user });

      dispatchEntities(entities);
      fixture.detectChanges();

      const alerts = fixture.debugElement.queryAll(By.css('.alert'));
      const textContent = alerts.map(a => a.nativeElement.textContent).join();
      expect(textContent).toContain(
        'You are not allowed to ship specimens. Please contact your website administrator.');
    });

    it('on no enabled centres should show noShippingCentres template', () => {
      const user = new User().deserialize(factory.user({
        roles: [
          factory.role({ id: RoleIds.ShippingUser })
        ]
      }));

      store.dispatch(AuthStoreActions.loginSuccessAction({ user }));
      const pagedReply = factory.pagedReply([]);
      store.dispatch(CentreStoreActions.searchCentresSuccess({ pagedReply }));

      fixture.detectChanges();

      const alerts = fixture.debugElement.queryAll(By.css('.alert'));
      const textContent = alerts.map(a => a.nativeElement.textContent).join();
      expect(textContent).toContain(
        'Shipping cannot be performed yet. There are no enabled centres.');
    });

  });

  function createEntities(options: EntitiesOptions = {}) {
    const centre = (options.centre !== undefined) ? options.centre : new Centre().deserialize(factory.centre());
    const user = (options.user !== undefined) ? options.user : new User().deserialize(factory.user());
    return { user, centre };
  }

  function dispatchEntities(options: EntitiesOptions = {}) {
    const { user, centre } = options;
    if (user) { store.dispatch(AuthStoreActions.loginSuccessAction({ user })); }
    if (centre) {
      const pagedReply = factory.pagedReply([centre]);
      store.dispatch(CentreStoreActions.searchCentresSuccess({ pagedReply }));
    }
  }

});
