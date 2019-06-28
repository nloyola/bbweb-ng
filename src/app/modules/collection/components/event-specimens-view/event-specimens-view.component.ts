import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material';
import { PagedReplyInfo, SearchParams } from '@app/domain';
import { CollectionEvent, Participant, Specimen } from '@app/domain/participants';
import { RootStoreState, SpecimenStoreActions, SpecimenStoreSelectors } from '@app/root-store';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap, startWith } from 'rxjs/operators';
import { SpecimenViewModalComponent } from '../specimen-view-modal/specimen-view-modal.component';

// For an example see:
// https://stackoverflow.com/questions/47871840/angular-material-2-table-server-side-pagination

@Component({
  selector: 'app-event-specimens-view',
  templateUrl: './event-specimens-view.component.html',
  styleUrls: ['./event-specimens-view.component.scss']
})
export class EventSpecimensViewComponent implements OnInit, OnChanges {

  @ViewChild('specimensTable', { static: true }) private specimensTable: ElementRef;
  @ViewChild('removeSpecimenModal', { static: true }) private removeSpecimenModal: TemplateRef<any>;

  @Input() event: CollectionEvent;
  @Input() participant: Participant;

  specimensPageInfo$: Observable<PagedReplyInfo<Specimen>>;
  specimens$: Observable<Specimen[]>;
  specimenToRemove: Specimen;
  faVial = faVial;
  tableDataLoading = false;
  currentPage = 1;
  specimensLimit = 5;
  sortField: string;

  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private modalService: NgbModal) { }

  ngOnInit() {
    this.sortField = 'inventoryId';
    this.applySearchParams();

    this.specimensPageInfo$ = this.store$.pipe(
      select(SpecimenStoreSelectors.selectSpecimenSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      shareReplay());

    this.specimens$ = this.specimensPageInfo$.pipe(
      filter(page => page !== undefined),
      tap(() => { this.tableDataLoading = false; }),
      map(page => page.entities));

    this.store$.pipe(
      select(SpecimenStoreSelectors.selectSpecimenLastRemovedId),
      filter(id => id !== null),
      takeUntil(this.unsubscribe$)
    ).subscribe((x) => {
      this.applySearchParams();
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.event) {
      this.event = changes.event.currentValue;
      this.applySearchParams();
    }
  }

  paginationPageChanged(page: number) {
    if (isNaN(page)) { return; }
    this.applySearchParams();

    // FIXME: not working 100%
    // scrolling works only in some cases
    this.specimensTable.nativeElement.scrollIntoView({behavior: 'smooth', block: 'end'});
  }

  viewSpecimen(specimen: Specimen) {
    const modalRef = this.modalService.open(SpecimenViewModalComponent, { size: 'lg' });
    modalRef.componentInstance.specimen = specimen;
    modalRef.componentInstance.event = this.event;
    modalRef.componentInstance.participant = this.participant;
  }

  removeSpecimen(specimen: Specimen) {
    this.specimenToRemove = specimen;

    this.modalService.open(this.removeSpecimenModal, { size: 'lg' }).result
      .then(() => {
        this.store$.dispatch(SpecimenStoreActions.removeSpecimenRequest({ specimen }));
        this.updatedMessage$.next('Specimen was removed');
      })
      .catch(() => {
        // user pressed the cancel button, do nothing
      });
  }

  private applySearchParams() {
    debugger;
    this.tableDataLoading = true;
    this.store$.dispatch(SpecimenStoreActions.searchSpecimensRequest({
      event: this.event,
      searchParams: new SearchParams('', // this.getFilters().join(';'),
                                     this.sortField,
                                     this.currentPage,
                                     this.specimensLimit)
    }));
  }

  sortData(sort: Sort) {
    switch (sort.direction) {
      case 'asc':
        this.sortField = sort.active;
        break;

      case 'desc':
        this.sortField = '-' + sort.active;
        break;

      default:
        this.sortField = '';
    }

    this.currentPage = 1;
    this.applySearchParams();
  }

}
