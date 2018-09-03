import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '@app/modules/material.module';

import { SharedModule } from '@app/shared/shared.module';
import { AdminModule } from '@app/modules/admin/admin.module';
import { CollectionModule } from '@app/modules/collection/collection.module';
import { HomeModule } from '@app/modules/home/home.module';
import { ShippingModule } from '@app/modules/shipping/shipping.module';
import { UsersModule } from '@app/modules/users/users.module';

import { AppComponent } from '@app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';

import { JwtInterceptor, ErrorInterceptor } from '@app/core/http';
import { RootStoreModule } from '@app/root-store/root-store.module';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    SharedModule,
    CollectionModule,
    HomeModule,
    ShippingModule,
    UsersModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    RootStoreModule,
    BrowserAnimationsModule,
    MaterialModule,
    ToastrModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    // { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
