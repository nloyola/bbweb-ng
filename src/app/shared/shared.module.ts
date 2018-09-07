import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MaterialModule } from '@app/modules/material.module';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SpinnerComponent } from './components/spinner/spinner.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule,
    MaterialModule,
    FontAwesomeModule
  ],
  declarations: [
    BreadcrumbsComponent,
    FooterComponent,
    HeaderComponent,
    PageNotFoundComponent,
    SpinnerComponent
  ],
  exports: [
    BreadcrumbsComponent,
    FooterComponent,
    HeaderComponent,
    PageNotFoundComponent,
    SpinnerComponent
  ]
})
export class SharedModule { }
