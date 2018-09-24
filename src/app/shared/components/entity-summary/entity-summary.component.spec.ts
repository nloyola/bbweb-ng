import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { EntitySummaryComponent } from './entity-summary.component';
import { ConcurrencySafeEntity } from '@app/domain';
import { TruncatePipe } from '@app/shared/pipes'
import { Factory } from '@app/test/factory';
import { Study } from '@app/domain/studies';

class TestDomainEntity extends ConcurrencySafeEntity {};

describe('EntitySummaryComponent', () => {

  @Component({
    template  : '<app-entity-summary [entity]="entity"></app-entity-summary>'
  })
  class TestComponent {
    factory = new Factory();
    entity = new Study().deserialize(this.factory.study());
  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        TestComponent,
        EntitySummaryComponent,
        TruncatePipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {

    expect(component).toBeTruthy();
  });
});
