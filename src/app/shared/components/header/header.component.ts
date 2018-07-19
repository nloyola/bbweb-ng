import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@app/users';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  private user: object;
  private isCollapsed = true;
  private userSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router) {
    this.user = this.authService.getUser();
  }

  ngOnInit() {
    this.userSubscription = this.authService.getUserObservable()
      .subscribe((user) => {
        this.user = user;
      });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
