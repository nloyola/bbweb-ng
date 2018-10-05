import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '@app/domain/users';
import { AuthStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<void> = new Subject<void>();

  userHasStudyAdminRole = false;
  userHasCentreAdminRole = false;
  userHasUserAdminRole = false;
  user: User;

  constructor(private store$: Store<RootStoreState.State>) {
  }

  public ngOnInit() {
    this.store$
      .pipe(
        select(AuthStoreSelectors.selectAuthUser),
        takeUntil(this.unsubscribe$))
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
