import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockingProgressComponent } from './blocking-progress.component';

describe('BlockingProgressComponent', () => {
  let component: BlockingProgressComponent;
  let fixture: ComponentFixture<BlockingProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BlockingProgressComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockingProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
