import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { StudyAddComponent } from './study-add.component';

describe('StudyAddComponent', () => {
  let component: StudyAddComponent;
  let fixture: ComponentFixture<StudyAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudyAddComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(StudyAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
