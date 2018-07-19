import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BreadcrumbsComponent } from '@app/shared/components/breadcrumbs/breadcrumbs.component';
import { HeaderComponent } from '@app/shared/components/header/header.component';
import { FooterComponent } from '@app/shared/components/footer/footer.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgbModule
  ],
  declarations: [BreadcrumbsComponent, HeaderComponent, FooterComponent],
  exports: [
    BreadcrumbsComponent,
    HeaderComponent,
    FooterComponent
  ]
})
export class SharedModule { }
