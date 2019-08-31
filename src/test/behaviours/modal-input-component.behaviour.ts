import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModalInputOptions } from '@app/modules/modals/models';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export namespace ModalInputComponentBehaviour {
  export interface Context<T, S> {
    fixture?: ComponentFixture<T>;
    componentInitialize?: () => void;
    assignOptions?: (options: ModalInputOptions) => void;
    assignMockModal?: (mockModal: NgbActiveModal) => void;
    assignInputValue?: (value: S) => void;
    getValidValue?: () => S;
    inputElement?: () => DebugElement;
    markInputAsTouched?: () => void;
    requiredText?: string;
    confirm?: () => void;
    dismiss?: () => void;
  }

  export function sharedBehaviour<T, S>(context: Context<T, S>) {
    describe('(modal input shared behaviour)', () => {
      it('when a value is required, the modal displays the error message', () => {
        context.assignOptions({ required: true });
        context.fixture.detectChanges();

        const inputElement = context.inputElement();
        expect(inputElement).not.toBeNull();
        inputElement.nativeElement.value = '';
        inputElement.nativeElement.dispatchEvent(new Event('input'));
        context.markInputAsTouched();
        context.fixture.detectChanges();

        const validationElement = context.fixture.debugElement.query(By.css('.text-danger'));
        expect(validationElement).not.toBeNull();
        expect(validationElement.nativeElement.textContent).toContain(context.requiredText);
      });

      it('when the user presses OK, the modal closes and returns the value', () => {
        const value = context.getValidValue();
        const closeListener = jest.fn();
        const mockModal = {
          close: closeListener,
          dismiss: undefined
        } as NgbActiveModal;

        context.assignOptions({});
        context.assignMockModal(mockModal);
        context.fixture.detectChanges();

        context.assignInputValue(value);
        context.confirm();
        expect(closeListener.mock.calls.length).toBe(1);
        expect(closeListener.mock.calls[0][0]).toEqual(value);
      });

      it('dismiss closes the modal', () => {
        const dismissListener = jest.fn();
        const mockModal = {
          close: undefined,
          dismiss: dismissListener
        } as NgbActiveModal;

        context.assignOptions({});
        context.assignMockModal(mockModal);
        context.fixture.detectChanges();
        context.dismiss();
        expect(dismissListener.mock.calls.length).toBe(1);
      });
    });
  }
}
