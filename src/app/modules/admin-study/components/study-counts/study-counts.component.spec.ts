import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { StudyCountInfo, StudyState } from '@app/domain/studies';
import { StudyCountsComponent } from './study-counts.component';

describe('StudyCountsComponent', () => {

  let component: StudyCountsComponent;
  let fixture: ComponentFixture<StudyCountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCountsComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCountsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.countData = new Map<StudyState, StudyCountInfo>([]);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
