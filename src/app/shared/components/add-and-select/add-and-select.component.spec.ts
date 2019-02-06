import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddAndSelectComponent } from './add-and-select.component';
import { ConcurrencySafeEntity } from '@app/domain';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

class TestEntity extends ConcurrencySafeEntity {}

describe('AddAndSelectComponent', () => {
  let component: AddAndSelectComponent<TestEntity>;
  let fixture: ComponentFixture<AddAndSelectComponent<TestEntity>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule
      ],
      declarations: [ AddAndSelectComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent<AddAndSelectComponent<TestEntity>>(AddAndSelectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
