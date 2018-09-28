import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { EntitySummaryComponent } from './entity-summary.component';
import { ConcurrencySafeEntity } from '@app/domain';
import { TruncatePipe } from '@app/shared/pipes';
import { Factory } from '@app/test/factory';
import { Study } from '@app/domain/studies';
import { StudyUI } from '@app/domain/studies/study-ui.model';
import { EntityUI } from '@app/domain';

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
    component.entityUI = {
      entity: new TestDomainEntity(),
      stateLabel: 'test',
      icon: 'test',
      iconClass: 'test'
    }
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('emits an event when the entity is selected', fakeAsync(() => {
    let entityUI: EntityUI<TestDomainEntity>;
    component.selected.subscribe((e: EntityUI<TestDomainEntity>) => entityUI = e);
    component.entityUI = {
      entity: new TestDomainEntity(),
      stateLabel: 'test',
      icon: 'test',
      iconClass: 'test'
    }
    fixture.detectChanges();
    expect(component).toBeTruthy();

    tick(500);
    component.linkSelected();
    expect(entityUI).toBeDefined();
  }));
});
