import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyAddComponent } from './study-add.component';

describe('StudyAddComponent', () => {
  let component: StudyAddComponent;
  let fixture: ComponentFixture<StudyAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
