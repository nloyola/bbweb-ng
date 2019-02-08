import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddAndSelectComponent } from './add-and-select.component';
import { ConcurrencySafeEntity, PagedReplyInfo } from '@app/domain';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

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
      declarations: [
        AddAndSelectComponent
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent<AddAndSelectComponent<TestEntity>>(AddAndSelectComponent);
    component = fixture.componentInstance;

    component.isAddAllowed = true;
    component.pageInfo = {
      hasNoEntitiesToDisplay: false,
      hasNoResultsToDisplay: false,
      hasResultsToDisplay: false,
      entities: [],
      total: 0,
      maxPages: 0,
      showPagination: true
    };
    component.isLoading = false;
    component.entitiesLimit = 5;
    component.page = 1;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('updates to name should emit an event', async(() => {
    fixture.detectChanges();
    let eventProduced = false;
    component.nameFilterUpdated.subscribe(() => { eventProduced = true; });

    const inputElem = fixture.debugElement.query(By.css('input'));
    inputElem.nativeElement.value = 'test';
    inputElem.nativeElement.dispatchEvent(new Event('input'));

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(eventProduced).toBe(true);
    });
  }));

  it('changes to page should emit an event', async(() => {
    fixture.detectChanges();
    let eventProduced = false;
    component.pageChange.subscribe(() => { eventProduced = true; });

    component.paginationPageChange(1);
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(eventProduced).toBe(true);
    });
  }));
});
