import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '@app/material.module';

import { SharedModule } from '@app/shared/shared.module';
import { AdminModule } from '@app/admin/admin.module';
import { CollectionModule } from '@app/collection/collection.module';
import { HomeModule } from '@app/home/home.module';
import { ShippingModule } from '@app/shipping/shipping.module';
import { UsersModule } from '@app/users/users.module';

import { AppComponent } from '@app/app.component';
import { AppRoutingModule } from '@app/app-routing.module';

import { JwtInterceptor, ErrorInterceptor } from '@app/http';
import { RootStoreModule } from '@app/root-store/root-store.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    SharedModule,
    AdminModule,
    CollectionModule,
    HomeModule,
    ShippingModule,
    UsersModule,
    AppRoutingModule,
    NgbModule.forRoot(),
    RootStoreModule,
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
