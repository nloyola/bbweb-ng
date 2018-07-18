import { Component, OnInit, Input } from '@angular/core';

import { Crumb } from '../../domain/crumb/crumb.model';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})

export class BreadcrumbsComponent implements OnInit {

  @Input() crumbs: Crumb[];

  constructor() { }

  ngOnInit() {
  }

}
