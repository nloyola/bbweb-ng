import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Sort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { PagedReplyInfo, SearchParams } from '@app/domain';
import { Specimen } from '@app/domain/participants';
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
export class ShipmentSpecimensTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() specimens: Specimen[];
  @Input() numPages: number;
  @Input() totalSpecimens: number;

  @Output() sortBy = new EventEmitter<string>();
  @Output() pageChanged = new EventEmitter<number>();

  shipment: Shipment;
  filterForm: FormGroup;
  pageInfo$: Observable<PagedReplyInfo<ShipmentSpecimen>>;

  maxPages$: Observable<number>;
  totalSpecimens$: Observable<number>;
  specimens$: Observable<ShipmentSpecimen[]>;
  sortField: string;
  currentPage: number;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.shipment = this.route.parent.snapshot.data.shipment;

    this.filterForm = this.formBuilder.group({ name: [''] });

    if (this.specimens) {
      this.specimens.map(s => (s instanceof Specimen ? s : new Specimen().deserialize(s)));
    } else {
      this.specimens = [];
    }

    this.pageInfo$ = this.store$.pipe(
      select(ShipmentSpecimenStoreSelectors.selectShipmentSpecimenSearchRepliesAndEntities),
      filter(x => x !== undefined),
      shareReplay()
    );

    this.specimens$ = this.pageInfo$.pipe(map(info => info.entities));
    this.maxPages$ = this.pageInfo$.pipe(map(info => info.maxPages));
    this.totalSpecimens$ = this.pageInfo$.pipe(map(info => info.total));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.specimens && changes.specimens.currentValue) {
      this.specimens = changes.specimens.currentValue.map((s: any) =>
        s instanceof Specimen ? s : new Specimen().deserialize(s)
      );
    }

    if (changes.numPages) {
      this.numPages = changes.numPages.currentValue;
    }

    if (changes.totalSpecimens) {
      this.totalSpecimens = changes.totalSpecimens.currentValue;
    }
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
    const searchParams = new SearchParams(null, null, this.currentPage);
    this.store$.dispatch(
      ShipmentSpecimenStoreActions.searchShipmentSpecimensRequest({
        shipment: this.shipment,
        searchParams
      })
    );
  }
}
