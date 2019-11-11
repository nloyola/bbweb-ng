import { NgForOfContext } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { DomainEntity, PagedReplyInfo } from '@app/domain';

@Component({
  selector: 'app-paged-entity-selector',
  templateUrl: './paged-entity-selector.component.html',
  styleUrls: ['./paged-entity-selector.component.scss']
})
export class PagedEntitySelectorComponent<T extends DomainEntity> implements OnInit {
  @ContentChild(TemplateRef, { static: true }) entityTemplate: TemplateRef<NgForOfContext<T>>;

  @Input() pageInfo: PagedReplyInfo<T>;
  @Input() isLoading: boolean;
  @Input() entitiesLimit: number;
  @Input() page: number;

  @Output() pageChange = new EventEmitter<number>();

  constructor() {}

  ngOnInit() {}

  public paginationPageChange(newPage: number) {
    this.pageChange.emit(newPage);
  }
}
