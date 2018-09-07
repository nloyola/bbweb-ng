import { Injectable } from '@angular/core';
import { SpinnerComponent } from '@app/shared/components/spinner/spinner.component';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private spinnerCache = new Map<string, SpinnerComponent>();

  constructor() { }

  register(spinner: SpinnerComponent): void {
    this.spinnerCache.set(spinner.name, spinner);
  }

  remove(spinnerName: string): void {
    const spinner = this.findSpinner(spinnerName);
    this.spinnerCache.delete(spinnerName);
  }

  show(spinnerName: string): void {
    const spinner = this.findSpinner(spinnerName);
    spinner.show = true;
  }

  hide(spinnerName: string): void {
    const spinner = this.findSpinner(spinnerName);
    spinner.show = false;
  }

  private findSpinner(spinnerName: string): SpinnerComponent {
    const spinner = this.spinnerCache.get(spinnerName);
    if (!spinner) {
      throw new Error(`spinner not found: ${spinnerName}`);
    }
    return spinner;
  }
}
