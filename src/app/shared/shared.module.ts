import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MaterialModule } from '@app/modules/material.module';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { EntityFiltersComponent } from './components/entity-filters/entity-filters.component';
import { TruncatePipe } from '@app/shared/pipes/truncate.pipe';
import { TimeagoPipe } from '@app/shared/pipes/timeago.pipe';
import { EntityStatusComponent } from './components/entity-status/entity-status.component';
import { EntitySummaryComponent } from './components/entity-summary/entity-summary.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    SpinnerComponent,
    EntityFiltersComponent,
    TimeagoPipe,
    TruncatePipe,
    EntityStatusComponent,
    EntitySummaryComponent
  ],
  exports: [
    BreadcrumbsComponent,
    FooterComponent,
    HeaderComponent,
    PageNotFoundComponent,
    SpinnerComponent,
    EntityFiltersComponent,
    TimeagoPipe,
    TruncatePipe,
    EntityStatusComponent,
    EntitySummaryComponent
  ]
})
export class SharedModule { }
