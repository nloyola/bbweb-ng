import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study, StudyState, StudyStateInfo } from '@app/domain/studies';
import { User } from '@app/domain/users';
import { ParticipantStoreReducer, RootStoreState, StudyStoreActions, StudyStoreReducer } from '@app/root-store';
import { AuthStoreActions, AuthStoreReducer } from '@app/root-store/auth-store';
import { TruncatePipe } from '@app/shared/pipes';
import { Store, StoreModule } from '@ngrx/store';
import { Factory } from '@test/factory';
import { ToastrService } from 'ngx-toastr';
import { CollectionPageComponent } from './collection-page.component';

describe('CollectionPageComponent', () => {

  let component: CollectionPageComponent;
  let fixture: ComponentFixture<CollectionPageComponent>;
  let store: Store<RootStoreState.State>;
  let toastr: ToastrService;
  let router: Router;
  const factory = new Factory();


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'participant': ParticipantStoreReducer.reducer,
          'auth': AuthStoreReducer.reducer
        })
      ],
      declarations: [
        CollectionPageComponent,
        TruncatePipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionPageComponent);
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
      const action = new AuthStoreActions.LoginSuccessAction({ user });
      store.dispatch(action);

      component.form.get('uniqueId').setValue('testId');
      component.onSubmit();
      expect('loading').toBeTruthy();
    });

    it('on invalid user should show invalidUser template', () => {
      const user = new User().deserialize(factory.user({roles: []}));
      const study = new Study().deserialize(factory.study());
      const studiesData = [
        new StudyStateInfo().deserialize(factory.entityNameAndStateDto<Study, StudyState>(study))
      ];

      store.dispatch(new AuthStoreActions.LoginSuccessAction({ user }));
      store.dispatch(StudyStoreActions.searchCollectionStudiesSuccess({ studiesData }));
      fixture.detectChanges();

      const alerts = fixture.debugElement.queryAll(By.css('.alert'));
      const textContent = alerts.map(a => a.nativeElement.textContent).join();
      expect(textContent).toContain(
        'You are not allowed to collect specimens. Please contact your website administrator.');

    });

  });

  describe('when submitting', () => {

  });
});
