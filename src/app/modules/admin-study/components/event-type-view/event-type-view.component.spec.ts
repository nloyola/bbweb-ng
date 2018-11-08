import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';
import { Factory } from '@app/test/factory';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { ToastrModule } from 'ngx-toastr';
import { EventTypeViewComponent } from './event-type-view.component';

describe('EventTypeViewComponent', () => {
  let component: EventTypeViewComponent;
  let fixture: ComponentFixture<EventTypeViewComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    factory = new Factory();

    TestBed.configureTestingModule({
      imports: [
        NgbModule.forRoot(),
        RouterTestingModule,
        StoreModule.forRoot({
          'spinner': SpinnerStoreReducer.reducer
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
        EventTypeViewComponent,
        YesNoPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTypeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
