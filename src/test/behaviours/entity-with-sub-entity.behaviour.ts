import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { TestUtils } from '@test/utils';

export namespace EntityWithSubEntityBehaviour {
  export interface BaseContext {
    dispatchParentEntity: () => void;
    dispatchUpdatedParentEntity: () => void;
    dispatchUpdatedParentEntityWithError: (error: any) => void;
    modalReturnValue: any;
  }

  export interface AddContext extends BaseContext {
    addChildEntity: () => void;
    checkAddUpdateRequest: (mockListener: any) => void;
  }

  export interface RemoveContext extends BaseContext {
    removeChildEntity: () => void;
    checkRemoveUpdateRequest: (mockListener: any) => void;
  }

  export function addSharedBehaviour(context: AddContext) {
    describe('(shared behaviour)', () => {
      let store: Store<{}>;
      let toastr: ToastrService;
      let storeListener: any;

      beforeEach(() => {
        store = TestBed.get(Store);
        toastr = TestBed.get(ToastrService);

        storeListener = jest.spyOn(store, 'dispatch');
        TestUtils.modalOpenListener(context.modalReturnValue);
        jest.spyOn(toastr, 'success').mockReturnValue(null);
        jest.spyOn(toastr, 'error').mockReturnValue(null);
      });

      it('dispatches an action', () => {
        context.dispatchParentEntity();
        storeListener.mockReset();
        context.addChildEntity();
        context.checkAddUpdateRequest(storeListener);
      });

      it('informs the user', () => {
        context.dispatchParentEntity();
        context.addChildEntity();
        context.dispatchUpdatedParentEntity();
        expect(toastr.success).toHaveBeenCalled();
      });

      it('informs the user about error replies', fakeAsync(() => {
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
              message: 'EntityCriteriaError: name already used'
            }
          }
        ];

        errors.forEach(error => {
          context.dispatchParentEntity();
          flush();
          context.addChildEntity();
          flush();
          context.dispatchUpdatedParentEntityWithError(error);
          flush();
          expect(toastr.error).toHaveBeenCalled();
        });
      }));
    });
  }

  export function removeSharedBehaviour(context: RemoveContext) {
    describe('(shared behaviour)', () => {
      let store: Store<{}>;
      let toastr: ToastrService;
      let storeListener: any;

      beforeEach(() => {
        store = TestBed.get(Store);
        toastr = TestBed.get(ToastrService);

        storeListener = jest.spyOn(store, 'dispatch');
        TestUtils.modalOpenListener(context.modalReturnValue);
        jest.spyOn(toastr, 'success').mockReturnValue(null);
        jest.spyOn(toastr, 'error').mockReturnValue(null);
      });

      it('dispatches an action', fakeAsync(() => {
        context.dispatchParentEntity();
        storeListener.mockReset();
        context.removeChildEntity();
        flush();
        context.checkRemoveUpdateRequest(storeListener);
      }));

      it('informs the user', fakeAsync(() => {
        context.dispatchParentEntity();
        context.removeChildEntity();
        flush();
        context.dispatchUpdatedParentEntity();
        flush();
        expect(toastr.success).toHaveBeenCalled();
      }));

      it('informs the user about error replies', fakeAsync(() => {
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
              message: 'EntityCriteriaError: name already used'
            }
          }
        ];

        errors.forEach(error => {
          context.dispatchParentEntity();
          flush();
          context.removeChildEntity();
          flush();
          context.dispatchUpdatedParentEntityWithError(error);
          flush();
          expect(toastr.error).toHaveBeenCalled();
        });
      }));
    });
  }
}
