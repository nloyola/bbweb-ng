import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConcurrencySafeEntity, DomainEntityUI } from '@app/domain';

@Component({
  selector: 'app-entity-summary',
  templateUrl: './entity-summary.component.html',
  styleUrls: ['./entity-summary.component.scss']
})
export class EntitySummaryComponent<T extends ConcurrencySafeEntity> implements OnInit {
  @Input() entity: DomainEntityUI<T>;
  @Input() icon: string;
  @Input() iconClass: string;

  @Output() selected = new EventEmitter<DomainEntityUI<T>>();

  constructor() {}

  ngOnInit() {}

  linkSelected() {
    this.selected.emit(this.entity);
  }
}
