import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { User } from '@app/domain/users/user.model';

import {
  RootStoreState,
  UserLoginStoreActions,
  UserLoginStoreSelectors
} from '@app/root-store';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  userLoginSubscription: Subscription;

  private user: User;
  private userHasStudyAdminRole = false;
  private userHasCentreAdminRole = false;
  private userHasUserAdminRole = false;

  constructor(private store$: Store<RootStoreState.State>) {
  }

  ngOnInit() {
    this.userLoginSubscription = this.store$
      .select(UserLoginStoreSelectors.selectUserLoginUser)
      .subscribe((user: User) => {
        this.user = user;
        if (user !== null) {
          this.userHasStudyAdminRole = user.hasStudyAdminRole();
          this.userHasCentreAdminRole = user.hasCentreAdminRole();
          this.userHasUserAdminRole = user.hasUserAdminRole();
        } else {
          this.userHasStudyAdminRole = false;
          this.userHasCentreAdminRole = false;
          this.userHasUserAdminRole = false;
        }
      });
  }

  public ngOnDestroy() {
    this.userLoginSubscription.unsubscribe();
  }

}
