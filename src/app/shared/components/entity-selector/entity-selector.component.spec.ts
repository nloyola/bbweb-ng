import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ConcurrencySafeEntity } from '@app/domain';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EntitySelectorComponent } from './entity-selector.component';

class TestEntity extends ConcurrencySafeEntity {}

describe('EntitySelectorComponent', () => {
  let component: EntitySelectorComponent<TestEntity>;
  let fixture: ComponentFixture<EntitySelectorComponent<TestEntity>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgbModule
      ],
      declarations: [ EntitySelectorComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent<EntitySelectorComponent<TestEntity>>(EntitySelectorComponent);
    component = fixture.componentInstance;

    component.entities = [ new TestEntity() ];
    component.isLoading = false;
    component.entitiesLimit = 5;
    component.page = 1;
    component.hasNoMatches = false;
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

  it('when there are no matches', () => {
    fixture.detectChanges();
    component.ngOnChanges({
      hasNoMatches: new SimpleChange(null, true, false)
    });
    fixture.detectChanges();
    expect(component.hasNoMatches).toBe(true);
    expect(component.hasNoResultsToDisplay).toBe(false);
  });
});
