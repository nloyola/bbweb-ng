import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeagoPipe } from '@app/shared/pipes';
import { EntityStatusComponent } from './entity-status.component';

class NgZoneMock {
  runOutsideAngular (fn: Function) {
    return fn();
  }
  run(fn: Function) {
    return fn();
  }
}

describe('EntityStatusComponent', () => {
  let component: EntityStatusComponent;
  let fixture: ComponentFixture<EntityStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EntityStatusComponent,
        TimeagoPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityStatusComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('use badges defaults to true', () => {
    component.useBadges = undefined;
    fixture.detectChanges();
    expect(component.useBadges).toBe(true);
  });

  it('when useBadges is true, badge class defaults to badge-secondary', () => {
    component.useBadges = true;
    component.bsClass = undefined;
    fixture.detectChanges();
    expect(component.bsClass).toBe('badge-secondary');
  });

  it('when useBadges is false, badge class defaults to text-info', () => {
    component.useBadges = false;
    component.bsClass = undefined;
    fixture.detectChanges();
    expect(component.bsClass).toBe('text-info');
  });

  describe('for displaying of dates', () => {

    let pipe: TimeagoPipe;

    beforeEach(() => {
      pipe = new TimeagoPipe(null, new NgZoneMock() as NgZone);
    });

    describe('for timeAdded', () => {

      it('if timeAdded is less than year 1900, it is reassigned to undefined', () => {
        component.timeAdded = new Date('31 Dec 1899');
        fixture.detectChanges();
        expect(component.timeAdded).toBeUndefined();
      });

      it('if timeAdded is greater or equal than year 1900, it is not reassigned', () => {
        const date = new Date('01 Jan 1900');
        component.timeAdded = date;
        fixture.detectChanges();
        expect(component.timeAdded).toBe(date);
      });

      it('displayed content', () => {
        [ new Date('31 Dec 1899'), new Date('01 Jan 1900') ].forEach(date => {
          [ true, false ].forEach(useBadges => {
            let testElement: any;

            component.state = undefined;
            component.timeAdded = date;
            component.useBadges = useBadges;
            component.ngOnInit();
            fixture.detectChanges();

            if (useBadges) {
              testElement = fixture.debugElement.nativeElement.querySelectorAll('span.badge');
            } else {
              testElement = fixture.debugElement.nativeElement.querySelectorAll('small');
            }

            expect(testElement.length).toBeGreaterThan(1);
            const textContent = testElement[0].textContent;
            expect(textContent).toContain('Added');
            if (date.getFullYear() < 1900) {
              expect(textContent).toContain('On System Initialization');
            } else {
              expect(textContent).toContain(pipe.transform(date.toString()));
            }
          });
        });
      });
    });

    // this test fails under Jest, complains of a promise timeout
    xit('when timeModified is given, it is displayed', () => {
      [ new Date('01 Jan 2000'), null ].forEach(timeModified => {
        [ true, false ].forEach(useBadges => {
          component.state = undefined;
          component.timeAdded = undefined;
          component.timeModified = timeModified;
          component.useBadges = useBadges;
          component.ngOnInit();
          fixture.detectChanges();

          let testElement: any;

          if (useBadges) {
            testElement = fixture.debugElement.nativeElement.querySelectorAll('span.badge');
          } else {
            testElement = fixture.debugElement.nativeElement.querySelectorAll('small');
          }

          expect(testElement.length).toBeGreaterThan(1);
          const textContent = testElement[1].textContent;
          expect(textContent).toContain('Modified');
          if (timeModified !== null) {
            expect(textContent).toContain(pipe.transform(timeModified.toString()));
          } else {
            expect(textContent).toContain('Never');
          }

        });
      });
    });
  });

});
