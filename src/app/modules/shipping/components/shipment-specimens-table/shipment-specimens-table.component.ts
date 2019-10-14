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
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { faVial } from '@fortawesome/free-solid-svg-icons';

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

  faVial = faVial;
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

  protected menuItemsForShipmentSpecimen(shipmentSpecimen: ShipmentSpecimen): DropdownMenuItem[] {
    return [
      {
        kind: 'selectable',
        label: 'View Specimen',
        icon: 'search',
        iconClass: 'success-icon',
        onSelected: () => {
          // TODO: implement this method
          console.error('view specimen');
        }
      },
      {
        kind: 'selectable',
        label: 'Remove Specimen from Shipment',
        icon: 'remove_circle',
        iconClass: 'danger-icon',
        onSelected: () => {
          // TODO: implement this method
          console.error('remove specimen');
        }
      }
    ];
  }
}
