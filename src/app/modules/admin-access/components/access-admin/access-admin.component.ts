import { Component, OnInit } from '@angular/core';
import { User } from '@app/domain/users';
import { AuthStoreSelectors, RootStoreState } from '@app/root-store';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Permissions {
  user: User;
  hasUserAdminRole: boolean;
}

@Component({
  selector: 'app-access-admin',
  templateUrl: './access-admin.component.html',
  styleUrls: ['./access-admin.component.scss']
})
export class AccessAdminComponent implements OnInit {

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
              hasUserAdminRole: false
            };
          }

          return {
              user,
              hasUserAdminRole: user.hasUserAdminRole()
          };
        }));
  }

}
