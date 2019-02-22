import { Component, OnInit } from '@angular/core';
import { User } from '@app/domain/users';
import { AuthStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Permissions {
  user: User;
  hasStudyAdminRole: boolean;
  hasCentreAdminRole: boolean;
  hasUserAdminRole: boolean;
  hasAdminRole: boolean;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  permissions$: Observable<Permissions>;

  constructor(private store$: Store<RootStoreState.State>) { }

  public ngOnInit() {
    this.permissions$ = this.store$
      .pipe(
        select(AuthStoreSelectors.selectAuthUser),
        map((user: User) => {
          if (user === null) {
            return {
              user,
              hasStudyAdminRole: false,
              hasCentreAdminRole: false,
              hasUserAdminRole: false,
              hasAdminRole: false
            };
          }

          return {
              user,
              hasStudyAdminRole: user.hasStudyAdminRole(),
              hasCentreAdminRole: user.hasCentreAdminRole(),
              hasUserAdminRole: user.hasUserAdminRole(),
              hasAdminRole: user.hasAdminRole()
          };
        }));
  }

}
