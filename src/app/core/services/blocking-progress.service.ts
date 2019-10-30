import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlockingProgressService {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject(null);

  constructor() {}

  show(): void {
    this.isLoading$.next(true);
  }

  hide(): void {
    this.isLoading$.next(false);
  }

  message(msg: string): void {
    this.loadingMessage$.next(msg);
  }
}
