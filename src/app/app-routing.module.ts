import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      { enableTracing: false /* true */ }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
