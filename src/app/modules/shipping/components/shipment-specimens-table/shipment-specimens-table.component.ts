import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Sort } from '@angular/material';
import { PagedReplyInfo } from '@app/domain';
import { Shipment, ShipmentSpecimen } from '@app/domain/shipments';
import {
  RootStoreState,
  ShipmentSpecimenStoreActions,
  ShipmentSpecimenStoreSelectors
} from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-shipment-specimens-table',
  templateUrl: './shipment-specimens-table.component.html',
  styleUrls: ['./shipment-specimens-table.component.scss']
})
export class ShipmentSpecimensTableComponent implements OnInit, OnDestroy {
  @Input() shipment: Shipment;
  @Input() numPages: number;
  @Input() totalSpecimens: number;

  @Output() sortBy = new EventEmitter<string>();
  @Output() pageChanged = new EventEmitter<number>();

  filterForm: FormGroup;
  pageInfo$: Observable<PagedReplyInfo<ShipmentSpecimen>>;

  maxPages$: Observable<number>;
  totalSpecimens$: Observable<number>;
  specimens$: Observable<ShipmentSpecimen[]>;
  sortField: string;
  currentPage: number;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.filterForm = this.formBuilder.group({ name: [''] });

    this.pageInfo$ = this.store$.pipe(
      select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenSearchRepliesAndEntities),
      filter(x => x !== undefined),
      shareReplay()
    );

    this.specimens$ = this.pageInfo$.pipe(map(info => info.entities));
    this.maxPages$ = this.pageInfo$.pipe(map(info => info.maxPages));
    this.totalSpecimens$ = this.pageInfo$.pipe(map(info => info.total));
    this.updateSpecimens();
  }

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  sortData(sort: Sort) {
    let sortField: string;
    switch (sort.direction) {
      case 'asc':
        sortField = sort.active;
        break;

      case 'desc':
        sortField = '-' + sort.active;
        break;

      default:
        sortField = '';
    }

    if (sort.active === 'date') {
      console.error('invalid sort field');
      return;
    }

    this.sortBy.emit(sortField);
  }

  public paginationPageChanged(page: number) {
    if (isNaN(page)) {
      return;
    }
    this.pageChanged.emit(page);
  }

  viewSpecimen(specimen: ShipmentSpecimen) {}

  removeSpecimen(specimen: ShipmentSpecimen) {
    console.error('removeSpecimen');
  }

  public paginationPageChange(page: number) {
    this.currentPage = page;
    this.updateSpecimens();
  }

  protected updateSpecimens(): void {
    const searchParams = { page: this.currentPage };
    this.store$.dispatch(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment: this.shipment,
        searchParams
      })
    );
  }
}
