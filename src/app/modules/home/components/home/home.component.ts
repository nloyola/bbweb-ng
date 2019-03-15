import { Component, OnInit } from '@angular/core';
import { User } from '@app/domain/users';
import { AuthStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  user$: Observable<User>;

  constructor(private store$: Store<RootStoreState.State>) {}

  ngOnInit() {
    this.user$ = this.store$.pipe(select(AuthStoreSelectors.selectAuthUser));
  }

}
