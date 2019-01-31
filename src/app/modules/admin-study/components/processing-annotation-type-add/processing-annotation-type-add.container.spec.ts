import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingAnnotationTypeAddContainerComponent } from './processing-annotation-type-add.container';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { ProcessingTypeStoreReducer } from '@app/root-store';
import { ToastrModule } from 'ngx-toastr';
import { MockActivatedRoute } from '@app/test/mocks';
import { Study, ProcessingType } from '@app/domain/studies';
import { Factory } from '@app/test/factory';
import { ActivatedRoute } from '@angular/router';

describe('ProcessingAnnotationTypeAddContainerComponent', () => {
  let component: ProcessingAnnotationTypeAddContainerComponent;
  let fixture: ComponentFixture<ProcessingAnnotationTypeAddContainerComponent>;
  let factory: Factory;
  const mockActivatedRoute = new MockActivatedRoute();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          'processing-type': ProcessingTypeStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [
        ProcessingAnnotationTypeAddContainerComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingAnnotationTypeAddContainerComponent);
    component = fixture.componentInstance;
    factory = new Factory();
  });

  it('should create', () => {
    const processingType = new ProcessingType().deserialize(factory.processingType());
    const study = new Study().deserialize(factory.defaultStudy());
    createMockActivatedRouteSpies(study, processingType);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  function createMockActivatedRouteSpies(study: Study, processingType: ProcessingType): void {
    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        parent: {
          parent: {
            snapshot: {
              data: {
                study
              },
              params: {
                slug: study.slug
              }
            }
          }
        }
      }
    }));

    mockActivatedRoute.spyOnSnapshot(() => ({
      params: {
        processingTypeSlug: processingType.slug
      }
    }));
  }
});
