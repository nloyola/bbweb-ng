import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotificationService } from '@app/core/services';
import { BlockingProgressService } from '@app/core/services/blocking-progress.service';
import { DomainEntity } from '@app/domain';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from '@ngrx/entity';
import { Store } from '@ngrx/store';

export namespace TestUtils {
  export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  export function entitiesToDictionary<T extends DomainEntity>(entities: T[]): Dictionary<T> {
    const result = {};
    entities.forEach(e => {
      result[e.id] = e;
    });
    return result;
  }

  export function notificationAddListener() {
    return jest.spyOn(TestBed.get(NotificationService), 'add').mockReturnValue(null);
  }

  export function notificationShowListener() {
    return jest.spyOn(TestBed.get(NotificationService), 'show').mockReturnValue(null);
  }

  export function notificationShowErrorListener() {
    return jest.spyOn(TestBed.get(NotificationService), 'showError').mockReturnValue(null);
  }

  export function routerNavigateListener() {
    return jest.spyOn(TestBed.get(Router), 'navigate').mockResolvedValue(true);
  }

  export function storeDispatchListener() {
    return jest.spyOn(TestBed.get(Store), 'dispatch');
  }

  export function modalOpenListener() {
    return jest.spyOn(TestBed.get(NgbModal), 'open').mockReturnValue({
      componentInstance: {},
      result: Promise.resolve('OK')
    });
  }

  export function blockingProgressShowListener() {
    return jest.spyOn(TestBed.get(BlockingProgressService), 'show');
  }

  export function blockingProgressHideListener() {
    return jest.spyOn(TestBed.get(BlockingProgressService), 'hide');
  }
}
