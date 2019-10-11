import { TestBed } from '@angular/core/testing';
import { DomainEntity } from '@app/domain';
import { Dictionary } from '@ngrx/entity';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
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

  export function toastrSuccessListener() {
    return jest.spyOn(TestBed.get(ToastrService), 'success').mockReturnValue(null);
  }

  export function toastrErrorListener() {
    return jest.spyOn(TestBed.get(ToastrService), 'error').mockReturnValue(null);
  }

  export function routerNavigateListener() {
    return jest.spyOn(TestBed.get(Router), 'navigate').mockResolvedValue(true);
  }

  export function storeDispatchListener() {
    return jest.spyOn(TestBed.get(Store), 'dispatch');
  }
}
