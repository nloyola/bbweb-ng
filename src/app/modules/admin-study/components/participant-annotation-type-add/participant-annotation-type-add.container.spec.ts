import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AnnotationType } from '@app/domain/annotations';
import { AnnotationTypeAddComponent } from '@app/shared/components/annotation-type-add/annotation-type-add.component';
import { StoreModule } from '@ngrx/store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { ToastrModule } from 'ngx-toastr';
import { Study } from '@app/domain/studies';
import { Factory } from '@app/test/factory';
import { ActivatedRoute } from '@angular/router';
import { ParticipantAnnotationTypeAddContainer } from './participant-annotation-type-add.container';
import { StudyStoreReducer } from '@app/root-store';

describe('ParticipantAnnotationTypeAddContainer', () => {
  let component: ParticipantAnnotationTypeAddContainer;
  let fixture: ComponentFixture<ParticipantAnnotationTypeAddContainer>;
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
            },
            snapshot: {
              params: {
                eventTypeSlug: 'test'
              }
            }
          }
        }
      ],
      declarations: [
        AnnotationTypeAddComponent,
        ParticipantAnnotationTypeAddContainer
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantAnnotationTypeAddContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
