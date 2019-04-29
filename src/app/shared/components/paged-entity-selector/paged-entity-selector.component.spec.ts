import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ConcurrencySafeEntity } from '@app/domain';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PagedEntitySelectorComponent } from './paged-entity-selector.component';

class TestEntity extends ConcurrencySafeEntity {}

describe('PagedEntitySelectorComponent', () => {
  let component: PagedEntitySelectorComponent<TestEntity>;
  let fixture: ComponentFixture<PagedEntitySelectorComponent<TestEntity>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule
      ],
      declarations: [ PagedEntitySelectorComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent<PagedEntitySelectorComponent<TestEntity>>(PagedEntitySelectorComponent);
    component = fixture.componentInstance;

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

  it('updates to name should emit an event', fakeAsync(() => {
    fixture.detectChanges();
    let eventProduced = false;
    component.nameFilterUpdated.subscribe(() => {
      eventProduced = true;
    });

    const inputElem = fixture.debugElement.query(By.css('input'));
    inputElem.nativeElement.value = 'test';
    inputElem.nativeElement.dispatchEvent(new Event('input'));
    tick(500);
    fixture.detectChanges();

    expect(eventProduced).toBe(true);
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
