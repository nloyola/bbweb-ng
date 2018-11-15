import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NlToBrPipe } from '@app/shared/pipes/nl-to-br.pipe';
import { TruncateToggleComponent } from './truncate-toggle.component';
import * as faker from 'faker';

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

  it('should see changes made to the text', () => {
    const testText = faker.lorem.paragraphs(3);
    const updatedText = testText.substring(0, testText.length / 4);
    component.text = testText;
    component.toggleLength = testText.length / 2;
    fixture.detectChanges();

    expect(component.displayText).toBe(testText);

    component.ngOnChanges({
      text: new SimpleChange(null, updatedText)
    });
    fixture.detectChanges();
    expect(component.displayText).toBe(updatedText);
  });

  it('user can toggle the text', () => {
    const truncatePipeEllipsisLength = 3;
    const testText = faker.lorem.paragraphs(3);
    component.text = testText;
    component.toggleLength = testText.length / 2;
    fixture.detectChanges();

    [ true, false ].forEach(toggle => {
      component.toggleText();
      fixture.detectChanges();

      if (toggle) {
        // subtract another 3 characters for the ellipsis used by the truncate pipe
        expect(component.displayText.includes(
          testText.substring(0, component.toggleLength - truncatePipeEllipsisLength)))
          .toBe(true);
      } else {
        expect(component.displayText).toBe(testText);
      }
    });

  });
});
