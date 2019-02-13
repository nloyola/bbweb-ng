import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Factory } from '@test/factory';
import { LocationAddComponent } from './location-add.component';
import { Location } from '@app/domain';

describe('LocationAddComponent', () => {

  let component: LocationAddComponent;
  let fixture: ComponentFixture<LocationAddComponent>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [ LocationAddComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationAddComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.location = new Location();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('can be created with an existing annotation', () => {
    component.location = new Location().deserialize({
      ...factory.location(),
      id: factory.stringNext()
    });

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.name.value).toEqual(component.location.name);
    expect(component.street.value).toEqual(component.location.street);
    expect(component.city.value).toEqual(component.location.city);
    expect(component.province.value).toEqual(component.location.province);
    expect(component.postalCode.value).toEqual(component.location.postalCode);
    expect(component.poBoxNumber.value).toEqual(component.location.poBoxNumber);
    expect(component.countryIsoCode.value).toEqual(component.location.countryIsoCode);
  });

  it('test for emitters', () => {
    const location = new Location().deserialize({
      ...factory.location(),
      id: factory.stringNext()
    });
    const testData = [
      {
        componentFunc: () => component.onSubmit(),
        emitter: component.submitted
      },
      {
        componentFunc: () => component.onCancel(),
        emitter: component.cancelled
      }
    ];

    component.location = location;
    fixture.detectChanges();

    testData.forEach(testInfo => {
      jest.spyOn(testInfo.emitter, 'emit').mockReturnValue(null);
      testInfo.componentFunc();
      expect(testInfo.emitter.emit).toHaveBeenCalled();
    });

  });
});
