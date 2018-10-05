import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@app/modules/material.module';
import { NlToBrPipe } from '@app/shared/pipes/nl-to-br.pipe';
import { TimeagoPipe } from '@app/shared/pipes/timeago.pipe';
import { TruncatePipe } from '@app/shared/pipes/truncate.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AnnotationTypeRemoveComponent } from './components/annotation-type-remove/annotation-type-remove.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { EntityFiltersComponent } from './components/entity-filters/entity-filters.component';
import { EntityStatusComponent } from './components/entity-status/entity-status.component';
import { EntitySummaryComponent } from './components/entity-summary/entity-summary.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { TruncateToggleComponent } from './components/truncate-toggle/truncate-toggle.component';


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
    EntitySummaryComponent,
    TruncateToggleComponent,
    NlToBrPipe,
    AnnotationTypeRemoveComponent
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
    EntitySummaryComponent,
    TruncateToggleComponent,
    NlToBrPipe,
    AnnotationTypeRemoveComponent
  ]
})
export class SharedModule { }
