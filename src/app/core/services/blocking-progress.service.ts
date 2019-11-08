import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlockingProgressService {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  constructor() {}

  show(loadingMessage: string): void {
    this.isLoading$.next(true);
    this.loadingMessage$.next(loadingMessage);
  }

  hide(): void {
    this.isLoading$.next(false);
    this.loadingMessage$.next(undefined);
  }
}
