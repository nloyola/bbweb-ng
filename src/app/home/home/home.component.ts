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
  private hasRoles: boolean = true;
  private userSubscription: Subscription;

  constructor(private authService: AuthService) {
    this.isUserAuthenticated = this.authService.isLoggedIn();
  }

  ngOnInit() {
    this.userSubscription = this.authService.getUserObservable()
      .subscribe((user) => {
        this.isUserAuthenticated = user !== null;
      });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }
}
