import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConcurrencySafeEntity } from '@app/domain';

@Component({
  selector: 'app-entity-summary',
  templateUrl: './entity-summary.component.html',
  styleUrls: ['./entity-summary.component.scss']
})
export class EntitySummaryComponent<T extends ConcurrencySafeEntity> implements OnInit {

  @Input() entity: T;
  @Input() icon: string

  @Output() onSelected = new EventEmitter<T>();

  constructor() { }

  ngOnInit() {
  }

  selected() {
    this.onSelected.emit(this.entity);
  }

}
