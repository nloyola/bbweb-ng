import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConcurrencySafeEntity, EntityUI } from '@app/domain';

@Component({
  selector: 'app-entity-summary',
  templateUrl: './entity-summary.component.html',
  styleUrls: ['./entity-summary.component.scss']
})
export class EntitySummaryComponent<T extends ConcurrencySafeEntity> implements OnInit {

  @Input() entityUI: EntityUI<T>;
  @Input() icon: string;
  @Input() iconClass: string;

  @Output() selected = new EventEmitter<EntityUI<T>>();

  constructor() { }

  ngOnInit() {
  }

  linkSelected() {
    this.selected.emit(this.entityUI);
  }

}
