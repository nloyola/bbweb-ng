import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { RootStoreState } from '@app/root-store';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Action, Store } from '@ngrx/store';
import { TestUtils } from '@test/utils';

export namespace EntityUpdateComponentBehaviour {
  export interface Context<T> {
    fixture: ComponentFixture<T>;
    componentInitialize: () => void;
    componentValidateInitialization: () => void;
    updateEntity: () => void;
    attributeName: string;

    // its possible the component uses a modal to get confirmation from the user to do the update,
    // this value would contain the value returned from the modal
    modalReturnValue: any;

    duplicateAttibuteValueError: string;
    dispatchSuccessAction: () => void;
    expectedSuccessAction: Action;
    createExpectedFailureAction: (error: any) => Action;
  }

  export function sharedBehaviour<T>(context: Context<T>) {
    describe('(shared behaviour)', () => {
      let store: Store<RootStoreState.State>;
      let modalService: NgbModal;
      let storeListener: jest.MockInstance<void, any[]>;
      let modalListener: jest.MockInstance<NgbModalRef, any>;
      let notificationShowListener: jest.MockInstance<void, any[]>;
      let notificationShowErrorListener: jest.MockInstance<void, any[]>;

      beforeEach(() => {
        store = TestBed.get(Store);
        modalService = TestBed.get(NgbModal);

        storeListener = jest.spyOn(store, 'dispatch');
        modalListener = jest.spyOn(modalService, 'open');
        modalListener.mockReturnValue(context.modalReturnValue);
        notificationShowListener = TestUtils.notificationShowListener();
        notificationShowErrorListener = TestUtils.notificationShowErrorListener();
      });

      describe('when successful', () => {
        const testCommon = () => {
          context.componentInitialize();
          flush();
          context.fixture.detectChanges();
          context.componentValidateInitialization();
          storeListener.mockClear();
          context.updateEntity();
          flush();
          context.fixture.detectChanges();
        };

        it('dispatches an action to update the entity', fakeAsync(() => {
          testCommon();
          expect(storeListener.mock.calls.length).toBe(1);
          expect(storeListener.mock.calls[0][0]).toEqual(context.expectedSuccessAction);
        }));

        it('informs the user the change was successful', fakeAsync(() => {
          testCommon();
          context.dispatchSuccessAction();
          flush();
          context.fixture.detectChanges();
          expect(notificationShowListener.mock.calls.length).toBe(1);
        }));
      });

      const errors = [
        {
          status: 401,
          statusText: 'Unauthorized'
        },
        {
          status: 404,
          error: {
            message: 'simulated error'
          }
        },
        {
          status: 404,
          error: {
            message: context.duplicateAttibuteValueError
          }
        }
      ];

      describe.each(errors)('for errors', error => {
        it('informs the user when an error occurs', fakeAsync(() => {
          context.componentInitialize();
          flush();
          context.fixture.detectChanges();
          context.componentValidateInitialization();

          context.updateEntity();
          flush();

          store.dispatch(context.createExpectedFailureAction(error));
          flush();
          context.fixture.detectChanges();

          expect(notificationShowErrorListener.mock.calls.length).toBe(1);
        }));
      });
    });
  }
}
