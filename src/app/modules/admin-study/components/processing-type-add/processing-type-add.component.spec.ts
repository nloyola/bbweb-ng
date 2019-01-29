import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessingTypeAddComponent } from './processing-type-add.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { ProcessingTypeStoreReducer } from '@app/root-store';
import { ToastrModule } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Study } from '@app/domain/studies';
import { Factory } from '@app/test/factory';

describe('ProcessingTypeAddComponent', () => {
  let component: ProcessingTypeAddComponent;
  let fixture: ComponentFixture<ProcessingTypeAddComponent>;
  let factory: Factory;
  let study: Study;

  beforeEach(async(() => {
    factory = new Factory();
    study = new Study().deserialize(factory.study());

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({
          'processing-type': ProcessingTypeStoreReducer.reducer
        }),
        ToastrModule.forRoot()
      ],
      declarations: [
        ProcessingTypeAddComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              parent: {
                snapshot: {
                  data: {
                    study
                  }
                }
              }
            },
            snapshot: {}
          }
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
