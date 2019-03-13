import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { EntityStateInfo, SearchFilterValues } from '@app/domain';
import { SearchFilter } from '@app/domain/search-filters';
import { Factory } from '@test/factory';
import * as faker from 'faker';
import { EntityFiltersComponent } from './entity-filters.component';

describe('EntityFiltersComponent', () => {

  let component: EntityFiltersComponent;
  let fixture: ComponentFixture<EntityFiltersComponent>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [ EntityFiltersComponent, EntityFiltersComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityFiltersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('default settings', () => {

    it('should not display name filter', () => {
      component.useEmailFilter = true;
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('#name'));
      expect(input).toBeNull();
    });

    it('should not display email filter', () => {
      component.useNameFilter = true;
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('#email'));
      expect(input).toBeNull();
    });

    it('should not display state filter', () => {
      component.useNameFilter = true;
      fixture.detectChanges();
      const select = fixture.debugElement.query(By.css('#state'));
      expect(select).toBeNull();
    });

  });

  it('name filter should be displayed', () => {
    component.useNameFilter = true;
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('#name'));
    expect(input).not.toBeNull();
  });

  it('email filter should be displayed', () => {
    component.useEmailFilter = true;
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('#email'));
    expect(input).not.toBeNull();
  });

  it('state filter should be displayed', () => {
    const stateData: EntityStateInfo[] = [
      { id: 'test', label: 'test'}
    ];
    component.stateData = stateData;
    fixture.detectChanges();
    const select = fixture.debugElement.query(By.css('#state'));
    expect(select).not.toBeNull();
  });

  it('should send a `filters` event when name input changes', fakeAsync(() => {
    const newValue = factory.stringNext();
    let filters: SearchFilterValues;
    component.filters.subscribe((f: SearchFilter) => filters = f);

    component.useNameFilter = true;
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('#name')).nativeElement;
    input.value = newValue;

    input.dispatchEvent(new Event('input'));
    tick(500);
    expect(filters.name).toBe(newValue);
  }));

  it('should send a `filters` event when email input changes', fakeAsync(() => {
    const newEmail = faker.internet.email();
    let filters: SearchFilterValues;
    component.filters.subscribe((f: SearchFilter) => filters = f);

    component.useEmailFilter = true;
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('#email')).nativeElement;
    input.value = newEmail;

    input.dispatchEvent(new Event('input'));
    tick(500);
    expect(filters.email).toBe(newEmail);
  }));

  it('should send a `filters` event when state selection changes', fakeAsync(() => {
    let filters: SearchFilterValues;
    component.filters.subscribe((f: SearchFilter) => filters = f);

    const stateData: EntityStateInfo[] = [
      { id: 'test', label: 'test'}
    ];
    component.stateData = stateData;
    fixture.detectChanges();

    const select = fixture.debugElement.query(By.css('#state')).nativeElement;
    select.value = stateData[0].id;

    select.dispatchEvent(new Event('change'));
    tick(500);
    expect(filters.stateId).toBe(stateData[0].id);
  }));

  it('should send a `filters` event when the filters are cleared', fakeAsync(() => {
    let filters: SearchFilterValues;
    component.filters.subscribe((f: SearchFilter) => filters = f);

    const stateData: EntityStateInfo[] = [
      { id: 'test', label: 'test'}
    ];

    component.useNameFilter = true;
    component.useEmailFilter = true;
    component.stateData = stateData;
    fixture.detectChanges();

    const elements = {
      name: fixture.debugElement.query(By.css('#name')).nativeElement,
      email: fixture.debugElement.query(By.css('#email')).nativeElement,
      state: fixture.debugElement.query(By.css('#state')).nativeElement,
      clearButton: fixture.debugElement.query(By.css('.btn')).nativeElement
    };

    elements.name.value = factory.stringNext();
    elements.email.value = faker.internet.email();
    elements.state.value = stateData[0].id;

    elements.name.dispatchEvent(new Event('input'));
    elements.email.dispatchEvent(new Event('input'));
    elements.state.dispatchEvent(new Event('change'));

    tick(500);
    expect(filters.name).not.toBe('');
    expect(filters.email).not.toBe('');
    expect(filters.stateId).toBe(stateData[0].id);

    elements.clearButton.dispatchEvent(new Event('click'));
    tick(500);
    expect(filters.name).toBe('');
    expect(filters.email).toBe('');
    expect(filters.stateId).toBe('all');
  }));

});
