import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NlToBrPipe } from '@app/shared/pipes/nl-to-br.pipe';
import { TruncateToggleComponent } from './truncate-toggle.component';

describe('TruncateToggleComponent', () => {
  let component: TruncateToggleComponent;
  let fixture: ComponentFixture<TruncateToggleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TruncateToggleComponent,
        NlToBrPipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TruncateToggleComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.text = '';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
