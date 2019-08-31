import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessingTypeCardComponent } from './processing-type-card.component';
import { TruncateToggleComponent } from '@app/shared/components/truncate-toggle/truncate-toggle.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NlToBrPipe } from '@app/shared/pipes/nl-to-br.pipe';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';

describe('ProcessingTypeCardComponent', () => {
  let component: ProcessingTypeCardComponent;
  let fixture: ComponentFixture<ProcessingTypeCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TruncateToggleComponent, ProcessingTypeCardComponent, NlToBrPipe, YesNoPipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
