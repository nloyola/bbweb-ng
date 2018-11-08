import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { EventTypeStoreReducer } from '@app/root-store';
import { Factory } from '@app/test/factory';
import { Store, StoreModule } from '@ngrx/store';
import { ToastrModule } from 'ngx-toastr';
import { EventTypeAddComponent } from './event-type-add.component';

describe('EventTypeAddComponent', () => {

  let store: Store<EventTypeStoreReducer.State>;
  let component: EventTypeAddComponent;
  let fixture: ComponentFixture<EventTypeAddComponent>;
  let router: Router;
  let factory: Factory;

  beforeEach(async(() => {
    factory = new Factory();

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
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
      declarations: [ EventTypeAddComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    router = TestBed.get(Router);

    fixture = TestBed.createComponent(EventTypeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
