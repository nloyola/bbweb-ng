import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessingTypeViewComponent } from './processing-type-view.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { YesNoPipe } from '@app/shared/pipes/yes-no-pipe';

describe('ProcessingTypeViewComponent', () => {
  let component: ProcessingTypeViewComponent;
  let fixture: ComponentFixture<ProcessingTypeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule.forRoot()
      ],
      declarations: [
        ProcessingTypeViewComponent,
        YesNoPipe
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingTypeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
