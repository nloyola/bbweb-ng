import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyCollectionComponent } from './study-collection.component';

describe('StudyCollectionComponent', () => {
  let component: StudyCollectionComponent;
  let fixture: ComponentFixture<StudyCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
