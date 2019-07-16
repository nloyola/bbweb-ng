import { NgForOfContext } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef
} from '@angular/core';
import { DomainEntity, PagedReplyInfo } from '@app/domain';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-paged-entity-selector',
  templateUrl: './paged-entity-selector.component.html',
  styleUrls: ['./paged-entity-selector.component.scss']
})
export class PagedEntitySelectorComponent<T extends DomainEntity> implements OnInit, OnDestroy {
  @Input() pageInfo: PagedReplyInfo<T>;
  @Input() isLoading: boolean;
  @Input() entitiesLimit: number;
  @Input() page: number;

  @Input() heading: TemplateRef<any>;
  @Input() footer: TemplateRef<any>;
  @Input() noEntitiesToDisplay: TemplateRef<any>;
  @Input() noResultsToDisplay: TemplateRef<any>;
  @Input() loadingContent: TemplateRef<any>;

  @ContentChild(TemplateRef, { static: true }) entityTemplate: TemplateRef<NgForOfContext<T>>;

  @Output() pageChange = new EventEmitter<number>();

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor() {}

  ngOnInit() {}

  public ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public paginationPageChange(newPage: number) {
    if (isNaN(newPage)) {
      return;
    }
    this.pageChange.emit(newPage);
  }
}
