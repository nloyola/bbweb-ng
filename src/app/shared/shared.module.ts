import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  imports: [
    CommonModule,
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
