import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantAnnotationTypeAddComponent } from './participant-annotation-type-add.component';

describe('ParticipantAnnotationTypeAddComponent', () => {
  let component: ParticipantAnnotationTypeAddComponent;
  let fixture: ComponentFixture<ParticipantAnnotationTypeAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParticipantAnnotationTypeAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantAnnotationTypeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
