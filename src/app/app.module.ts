import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/app.component';
import { ErrorInterceptor, JwtInterceptor } from '@app/core/http';
import { HomeModule } from '@app/modules/home/home.module';
import { MaterialModule } from '@app/modules/material.module';
import { ShippingModule } from '@app/modules/shipping/shipping.module';
import { UsersModule } from '@app/modules/users/users.module';
import { RootStoreModule } from '@app/root-store/root-store.module';
import { SharedModule } from '@app/shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

@Injectable()
class UIErrorHandler extends ErrorHandler {
  constructor() {
    super();
  }
  handleError(error) {
    super.handleError(error);
    //alert(`Error occurred:${error.message}`);
  }
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    SharedModule,
    HomeModule,
    ShippingModule,
    UsersModule,
    AppRoutingModule,
    NgbModule,
    RootStoreModule,
    BrowserAnimationsModule,
    MaterialModule,
    ToastrModule.forRoot()
    // ErrorHandlerModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: ErrorHandler, useClass: UIErrorHandler }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
