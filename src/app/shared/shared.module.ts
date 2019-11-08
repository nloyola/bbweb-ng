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
import { AnnotationTypeActionsComponent } from './components/annotation-type-actions/annotation-type-actions.component';
import { AnnotationTypeAddComponent } from './components/annotation-type-add/annotation-type-add.component';
import { AnnotationTypeRemoveComponent } from './components/annotation-type-remove/annotation-type-remove.component';
import { AnnotationTypeViewComponent } from './components/annotation-type-view/annotation-type-view.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { EntityFiltersComponent } from './components/entity-filters/entity-filters.component';
import { EntityStatusComponent } from './components/entity-status/entity-status.component';
import { EntitySummaryComponent } from './components/entity-summary/entity-summary.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { LocationAddComponent } from './components/location-add/location-add.component';
import { LocationRemoveComponent } from './components/location-remove/location-remove.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { TruncateToggleComponent } from './components/truncate-toggle/truncate-toggle.component';
import { YesNoPipe } from './pipes/yes-no-pipe';
import { EntitySelectorComponent } from './components/entity-selector/entity-selector.component';
import { UnauthorizedPageComponent } from './components/unauthorized-page/unauthorized-page.component';
import { ServerErrorPageComponent } from './components/server-error-page/server-error-page.component';
import { PagedEntitySelectorComponent } from './components/paged-entity-selector/paged-entity-selector.component';
import { LocalTimePipe } from './pipes';
import { FilterValueInputComponent } from './components/filter-value-input/filter-value-input.component';
import { DropdownMenuComponent } from './components/dropdown-menu/dropdown-menu.component';
import { BlockingSpinnerComponent } from './components/blocking-spinner/blocking-spinner.component';
import { BlockingProgressComponent } from './components/blocking-progress/blocking-progress.component';

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
    LocalTimePipe,
    EntityStatusComponent,
    EntitySummaryComponent,
    TruncateToggleComponent,
    NlToBrPipe,
    YesNoPipe,
    AnnotationTypeActionsComponent,
    AnnotationTypeAddComponent,
    AnnotationTypeViewComponent,
    AnnotationTypeRemoveComponent,
    LocationAddComponent,
    LocationRemoveComponent,
    EntitySelectorComponent,
    UnauthorizedPageComponent,
    ServerErrorPageComponent,
    PagedEntitySelectorComponent,
    FilterValueInputComponent,
    DropdownMenuComponent,
    BlockingSpinnerComponent,
    BlockingProgressComponent
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
    LocalTimePipe,
    EntityStatusComponent,
    EntitySummaryComponent,
    TruncateToggleComponent,
    NlToBrPipe,
    YesNoPipe,
    AnnotationTypeActionsComponent,
    AnnotationTypeAddComponent,
    AnnotationTypeViewComponent,
    AnnotationTypeRemoveComponent,
    EntitySelectorComponent,
    PagedEntitySelectorComponent,
    LocationAddComponent,
    FilterValueInputComponent,
    DropdownMenuComponent,
    BlockingSpinnerComponent,
    BlockingProgressComponent
  ]
})
export class SharedModule {}
