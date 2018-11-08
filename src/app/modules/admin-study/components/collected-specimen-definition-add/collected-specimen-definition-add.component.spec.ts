import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CollectedSpecimenDefinition } from '@app/domain/studies';
import { AuthStoreReducer } from '@app/root-store/auth-store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { Factory } from '@app/test/factory';
import { Store, StoreModule } from '@ngrx/store';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CollectedSpecimenDefinitionAddComponent } from './collected-specimen-definition-add.component';

describe('CollectedSpecimenDefinitionAddComponent', () => {

  let store: Store<AuthStoreReducer.State>;
  let router: Router;
  let toastrService: ToastrService;
  let factory: Factory;
  let component: CollectedSpecimenDefinitionAddComponent;
  let fixture: ComponentFixture<CollectedSpecimenDefinitionAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'auth': AuthStoreReducer.reducer,
          'spinner': SpinnerStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [ CollectedSpecimenDefinitionAddComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    toastrService = TestBed.get(ToastrService);
    factory = new Factory();

    fixture = TestBed.createComponent(CollectedSpecimenDefinitionAddComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.specimenDefinition = new CollectedSpecimenDefinition();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
