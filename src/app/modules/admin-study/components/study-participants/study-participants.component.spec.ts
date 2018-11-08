import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Study } from '@app/domain/studies';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { Factory } from '@app/test/factory';
import { StoreModule } from '@ngrx/store';
import { ToastrModule } from 'ngx-toastr';
import { StudyParticipantsComponent } from './study-participants.component';
import { StudyStoreReducer } from '@app/root-store';

describe('StudyParticipantsComponent', () => {
  let component: StudyParticipantsComponent;
  let fixture: ComponentFixture<StudyParticipantsComponent>;
  let factory: Factory;

  beforeEach(async(() => {
    factory = new Factory();

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          'spinner': SpinnerStoreReducer.reducer,
          'study': StudyStoreReducer.reducer
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
      declarations: [ StudyParticipantsComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
