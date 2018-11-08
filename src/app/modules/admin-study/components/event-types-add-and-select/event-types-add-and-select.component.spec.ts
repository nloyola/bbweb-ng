import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { TruncatePipe } from '@app/shared/pipes';
import { Factory } from '@app/test/factory';
import { StoreModule } from '@ngrx/store';
import { EventTypesAddAndSelectComponent } from './event-types-add-and-select.component';
import { StudyStoreReducer, EventTypeStoreReducer } from '@app/root-store';

describe('EventTypesAddAndSelectComponent', () => {
  let component: EventTypesAddAndSelectComponent;
  let fixture: ComponentFixture<EventTypesAddAndSelectComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    factory = new Factory();

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'spinner': SpinnerStoreReducer.reducer,
          'study': StudyStoreReducer.reducer,
          'event-type': EventTypeStoreReducer.reducer
        })
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
        EventTypesAddAndSelectComponent,
        TruncatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTypesAddAndSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
