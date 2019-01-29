import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyProcessingComponent } from './study-processing.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { ProcessingTypeStoreReducer } from '@app/root-store';
import { RouterTestingModule } from '@angular/router/testing';

describe('StudyProcessingComponent', () => {
  let component: StudyProcessingComponent;
  let fixture: ComponentFixture<StudyProcessingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          'processing-type': ProcessingTypeStoreReducer.reducer
        })
      ],
      declarations: [ StudyProcessingComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
