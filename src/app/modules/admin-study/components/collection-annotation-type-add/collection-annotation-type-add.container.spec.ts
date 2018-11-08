import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { AnnotationType } from '@app/domain/annotations';
import { AnnotationTypeAddComponent } from '@app/shared/components/annotation-type-add/annotation-type-add.component';
import { CollectionAnnotationTypeAddContainer } from './collection-annotation-type-add.container';
import { StoreModule } from '@ngrx/store';
import { SpinnerStoreReducer } from '@app/root-store/spinner';
import { ToastrModule } from 'ngx-toastr';
import { Study } from '@app/domain/studies';
import { Factory } from '@app/test/factory';
import { ActivatedRoute } from '@angular/router';
import { EventTypeStoreReducer, StudyStoreReducer } from '@app/root-store';

describe('CollectionAnnotationTypeAddContainer', () => {
  let component: CollectionAnnotationTypeAddContainer;
  let fixture: ComponentFixture<CollectionAnnotationTypeAddContainer>;
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
        CollectionAnnotationTypeAddContainer
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionAnnotationTypeAddContainer);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.annotationType = new AnnotationType();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
