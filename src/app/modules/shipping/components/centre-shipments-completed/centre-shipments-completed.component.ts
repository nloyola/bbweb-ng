import { Component } from '@angular/core';
import { CentreShipmentsIncomingComponent } from '../centre-shipments-incoming/centre-shipments-incoming.component';

@Component({
  selector: 'app-centre-shipments-completed',
  templateUrl: './centre-shipments-completed.component.html',
  styleUrls: ['./centre-shipments-completed.component.scss']
})
export class CentreShipmentsCompletedComponent extends CentreShipmentsIncomingComponent {
  protected updateFilters(): string {
    return super.updateFilters() + ';state::completed';
  }
}
