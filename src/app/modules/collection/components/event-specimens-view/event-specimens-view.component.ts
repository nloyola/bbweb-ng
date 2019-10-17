import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Sort } from '@angular/material';
import { PagedReplyInfo } from '@app/domain';
import { CollectionEvent, Participant, Specimen } from '@app/domain/participants';
import { RootStoreState, SpecimenStoreActions, SpecimenStoreSelectors } from '@app/root-store';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { faVial } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap } from 'rxjs/operators';
import { SpecimenViewModalComponent } from '../specimen-view-modal/specimen-view-modal.component';

// For an example see:
// https://stackoverflow.com/questions/47871840/angular-material-2-table-server-side-pagination

@Component({
  selector: 'app-event-specimens-view',
  templateUrl: './event-specimens-view.component.html',
  styleUrls: ['./event-specimens-view.component.scss']
})
export class EventSpecimensViewComponent implements OnInit, OnChanges {
  @ViewChild('specimensTable', { static: true }) specimensTable: ElementRef;
  @ViewChild('removeSpecimenModal', { static: false }) removeSpecimenModal: TemplateRef<any>;

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
  menuItems: DropdownMenuItem[];

  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>, private modalService: NgbModal) {
    this.menuItems = this.createMenuItems();
  }

  ngOnInit() {
    this.sortField = 'inventoryId';
    this.applySearchParams();

    this.specimensPageInfo$ = this.store$.pipe(
      select(SpecimenStoreSelectors.selectSpecimenSearchRepliesAndEntities),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.specimens$ = this.specimensPageInfo$.pipe(
      filter(page => page !== undefined),
      tap(() => {
        this.tableDataLoading = false;
      }),
      map(page => page.entities)
    );

    this.store$
      .pipe(
        select(SpecimenStoreSelectors.selectSpecimenLastRemovedId),
        filter(id => id !== null),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(x => {
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
    if (isNaN(page)) {
      return;
    }
    this.applySearchParams();

    // FIXME: not working 100%
    // scrolling works only in some cases
    // if (this.specimensTable.nativeElement.scrollIntoView) {
    //   this.specimensTable.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    // }
  }

  viewSpecimen(specimen: Specimen) {
    const modalRef = this.modalService.open(SpecimenViewModalComponent, { size: 'lg' });
    modalRef.componentInstance.specimen = specimen;
  }

  removeSpecimen(specimen: Specimen) {
    this.specimenToRemove = specimen;

    this.modalService
      .open(this.removeSpecimenModal, { size: 'lg' })
      .result.then(() => {
        this.store$.dispatch(SpecimenStoreActions.removeSpecimenRequest({ specimen }));
      })
      .catch(() => {
        // user pressed the cancel button, do nothing
      });
  }

  private applySearchParams() {
    this.tableDataLoading = true;
    const searchParams = {
      sort: this.sortField,
      page: this.currentPage,
      limit: this.specimensLimit
    };
    this.store$.dispatch(
      SpecimenStoreActions.searchSpecimensRequest({
        event: this.event,
        searchParams
      })
    );
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

  private createMenuItems(): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'Add Specimen',
        icon: 'add_circle',
        iconClass: 'success-icon',
        onSelected: () => {
          alert('needs implementation');
        }
      }
    ];
    return items;
  }

  createSpecimenMenuItems(specimen: Specimen): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'View Specimen',
        icon: 'search',
        iconClass: 'success-icon',
        onSelected: () => {
          this.viewSpecimen(specimen);
        }
      },
      {
        kind: 'selectable',
        label: 'Remove Specimen',
        icon: 'remove_circle',
        iconClass: 'danger-icon',
        onSelected: () => {
          this.removeSpecimen(specimen);
        }
      }
    ];
    return items;
  }
}
