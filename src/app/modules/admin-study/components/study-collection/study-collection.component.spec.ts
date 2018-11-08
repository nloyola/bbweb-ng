import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { EventTypeStoreReducer, StudyStoreReducer } from '@app/root-store';
import { TruncatePipe } from '@app/shared/pipes';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { Factory } from '@app/test/factory';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { ToastrModule } from 'ngx-toastr';
import { EventTypeViewComponent } from '../event-type-view/event-type-view.component';
import { EventTypesAddAndSelectComponent } from '../event-types-add-and-select/event-types-add-and-select.component';
import { StudyCollectionComponent } from './study-collection.component';
import { SpinnerStoreReducer } from '@app/root-store/spinner';

describe('StudyCollectionComponent', () => {
  let component: StudyCollectionComponent;
  let fixture: ComponentFixture<StudyCollectionComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    factory = new Factory();

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule.forRoot(),
        RouterTestingModule,
        StoreModule.forRoot({
          'spinner': SpinnerStoreReducer.reducer,
          'study': StudyStoreReducer.reducer,
          'event-type': EventTypeStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              parent: {
                snapshot: {
                  data: {
                    study: new Study().deserialize(factory.study())
                  }
                }
              }
            }
          }
        }
      ],
      declarations: [
        StudyCollectionComponent,
        EventTypesAddAndSelectComponent,
        EventTypeViewComponent,
        TruncatePipe,
        YesNoPipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
