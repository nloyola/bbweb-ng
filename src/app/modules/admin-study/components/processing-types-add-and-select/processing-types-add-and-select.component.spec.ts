import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessingTypeStoreReducer } from '@app/root-store';
import { TruncatePipe } from '@app/shared/pipes';
import { StoreModule } from '@ngrx/store';
import { ProcessingTypesAddAndSelectComponent } from './processing-types-add-and-select.component';
import { Factory } from '@test/factory';
import { Study } from '@app/domain/studies';

describe('ProcessingTypesAddAndSelectComponent', () => {
  let component: ProcessingTypesAddAndSelectComponent;
  let fixture: ComponentFixture<ProcessingTypesAddAndSelectComponent>;
  let factory: Factory;
  let study: Study;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({
          'processing-type': ProcessingTypeStoreReducer.reducer
        })
      ],
      declarations: [
        ProcessingTypesAddAndSelectComponent,
        TruncatePipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();

    factory = new Factory();
    study = new Study().deserialize(factory.study());
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypesAddAndSelectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.study = study;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
