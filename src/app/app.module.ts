import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeModule } from './home/home.module';

const routes = [
  // { path: '', pathMatch, 'full', redirectTo: 'home' },
  // { path: 'home', component: HomeComponent }
];

@NgModule({
  declarations: [AppComponent]
  imports: [
    BrowserModule,
    HomeModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})

export class AppModule { }
