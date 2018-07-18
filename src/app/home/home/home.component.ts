import { Component } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { Crumb } from '../../domain/crumb/crumb.model';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent {
  userIsAuthenticated = true;
  hasRoles = true;
  breadcrumbs: Crumb[] = [
    new Crumb('Home', '/home')
  ];
}
