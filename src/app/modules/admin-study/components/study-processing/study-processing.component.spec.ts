import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ProcessingTypeStoreReducer, StudyStoreReducer, StudyStoreActions } from '@app/root-store';
import { Store, StoreModule } from '@ngrx/store';
import { StudyProcessingComponent } from './study-processing.component';
import { Study, StudyState } from '@app/domain/studies';
import { Factory } from '@test/factory';
import { MockActivatedRoute } from '@test/mocks';

describe('StudyProcessingComponent', () => {

  let component: StudyProcessingComponent;
  let fixture: ComponentFixture<StudyProcessingComponent>;
  let store: Store<StudyStoreReducer.State>;
  const mockActivatedRoute = new MockActivatedRoute();
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        StoreModule.forRoot({
          'study': StudyStoreReducer.reducer,
          'processing-type': ProcessingTypeStoreReducer.reducer
        })
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ],
      declarations: [ StudyProcessingComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    fixture = TestBed.createComponent(StudyProcessingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const study = new Study().deserialize(factory.study());
    expect(study.state).toBe(StudyState.Disabled);
    mockActivatedRouteSnapshot(study);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('when user wants to add an processing type', () => {

    xit('changes state if study is disabled', async(() => {
      const ngZone = TestBed.get(NgZone);
      ngZone.run(() => router.initialNavigation());

      const router = TestBed.get(Router);
      const routerListener = jest.spyOn(router, 'navigate');

      const study = new Study().deserialize(factory.study());
      expect(study.state).toBe(StudyState.Disabled);
      mockActivatedRouteSnapshot(study);

      // export const adapter: EntityAdapter<ProcessingType> = createEntityAdapter<ProcessingType>();

      store.dispatch(new StudyStoreActions.GetStudySuccess({ study }));
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        ngZone.run(() => component.addProcessingTypeSelected());
        expect(routerListener.mock.calls.length).toBe(1);
        expect(routerListener.mock.calls[0][0]).toEqual([ '../add' ]);
      });
    }));

    xit('throws an error if is study is not disabled', () => {
      [ StudyState.Enabled, StudyState.Retired ].forEach(state => {
        const studyWrongState = new Study().deserialize({
          ...factory.study(),
          state
        });
        mockActivatedRouteSnapshot(studyWrongState);
        component.ngOnInit();
        expect(() => component.addEventTypeSelected()).toThrowError('modifications not allowed');
      });
    });

  });

  function mockActivatedRouteSnapshot(study: Study): void {
    mockActivatedRoute.spyOnParent(() => ({
      parent: {
        snapshot: {
          params: {}
        }
      }
    }));
  }
});
