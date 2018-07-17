import { Component } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  title = 'home';
}
