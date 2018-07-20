import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { SharedModule } from '@app/shared/shared.module';
import { Crumb } from '@app/domain/crumb/crumb.model';
import { AuthService } from '@app/users';

@Component({
  selector: 'home',
  templateUrl: './home.component.html'
})

export class HomeComponent implements OnInit, OnDestroy {

  private isUserAuthenticated: boolean;
  private hasRoles: boolean;
  private userSubscription: Subscription;

  constructor(private authService: AuthService) {
    this.isUserAuthenticated = this.authService.isLoggedIn();

    const user = this.authService.getUser();
    console.log(user);
    if (user) {
      this.hasRoles = user.roles.length > 0;
    }

  }

  ngOnInit() {
    this.userSubscription = this.authService.getUserObservable()
      .subscribe((user: any) => {
        if (user) {
          this.isUserAuthenticated = true;
          this.hasRoles = user.roles.length > 0;
          // this.allowCollection = this.user.hasSpecimenCollectorRole();
          // this.shippingAllowed = this.user.hasShippingUserRole();
          // this.adminAllowed = this.user.hasAdminRole();
        }
      });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }
}
