import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RootStoreState } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Action, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

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
      let router: Router;
      let modalService: NgbModal;
      let toastr: ToastrService;
      let storeListener: any;
      let modalListener: any;
      let toastrSuccessListener: any;
      let toastrErrorListener: any;

      beforeEach(() => {
        store = TestBed.get(Store);
        modalService = TestBed.get(NgbModal);
        toastr = TestBed.get(ToastrService);
        router = TestBed.get(Router);

        jest.spyOn(router, 'navigate').mockResolvedValue(true);
        jest.spyOn(modalService, 'open').mockReturnValue(context.modalReturnValue);

        storeListener = jest.spyOn(store, 'dispatch');
        modalListener = jest.spyOn(modalService, 'open');
        modalListener.mockReturnValue(context.modalReturnValue);
        toastrSuccessListener = jest.spyOn(toastr, 'success').mockReturnValue(null);
        toastrErrorListener = jest.spyOn(toastr, 'error').mockReturnValue(null);
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
          expect(toastrSuccessListener.mock.calls.length).toBe(1);
        }));

      });

      it('informs the user when an error occurs', fakeAsync(() => {
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

        context.componentInitialize();
        flush();
        context.fixture.detectChanges();
        context.componentValidateInitialization();

        errors.forEach(error => {
          toastrErrorListener.mockClear();
          context.updateEntity();
          flush();

          store.dispatch(context.createExpectedFailureAction(error));
          flush();
          context.fixture.detectChanges();

          expect(toastrErrorListener.mock.calls.length).toBe(1);
        });

      }));

    });

  }

}
