import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { User } from '@app/domain/users';

import {
  RootStoreState,
  AuthStoreActions,
  AuthStoreSelectors
} from '@app/root-store';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<void> = new Subject<void>();

  private user: User;
  private userHasStudyAdminRole = false;
  private userHasCentreAdminRole = false;
  private userHasUserAdminRole = false;

  constructor(private store$: Store<RootStoreState.State>) {
  }

  public ngOnInit() {
    this.store$
      .select(AuthStoreSelectors.selectAuthUser)
      .pipe(takeUntil(this.unsubscribe$))
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
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
