import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ConcurrencySafeEntity, EntityUI, DomainEntityUI } from '@app/domain';
import { TruncatePipe } from '@app/shared/pipes';
import { EntitySummaryComponent } from './entity-summary.component';

class TestDomainEntity extends ConcurrencySafeEntity {

  name: string;

}

describe('EntitySummaryComponent', () => {

  let component: EntitySummaryComponent<TestDomainEntity>;
  let fixture: ComponentFixture<EntitySummaryComponent<TestDomainEntity>>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        EntitySummaryComponent,
        TruncatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    router = TestBed.get(Router);
    fixture = TestBed.createComponent<EntitySummaryComponent<TestDomainEntity>>(
      EntitySummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.entity = {
      entity: new TestDomainEntity(),
      stateLabel: () => 'test',
      stateIcon: () => 'test',
      stateIconClass: () => 'test'
    }
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('emits an event when the entity is selected', fakeAsync(() => {
    let entityUI: DomainEntityUI<TestDomainEntity>;
    component.selected.subscribe((e: DomainEntityUI<TestDomainEntity>) => entityUI = e);
    component.entity = {
      entity: new TestDomainEntity(),
      stateLabel: () => 'test',
      stateIcon: () => 'test',
      stateIconClass: () => 'test'
    }
    fixture.detectChanges();
    expect(component).toBeTruthy();

    tick(500);
    component.linkSelected();
    expect(entityUI).toBeDefined();
  }));
});
