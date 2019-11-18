import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Stack } from '../stack';

interface NotificationMessage {
  readonly message: string;
  readonly title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationStack = new Stack<NotificationMessage>();
  private errorNotificationStack = new Stack<NotificationMessage>();

  constructor(private toastr: ToastrService) {}

  add(message: string, title?: string): void {
    // console.log('add', message);
    this.notificationStack.push({ message, title });
  }

  show(message?: string, title?: string): void {
    let notification: NotificationMessage;
    if (message) {
      notification = { message, title };
    } else {
      notification = this.notificationStack.pop();
    }
    this.toastr.success(notification.message, notification.title);
  }

  showError(message?: string, title?: string): void {
    let notification: NotificationMessage;
    if (message) {
      notification = { message, title: title ? title : 'Error' };
    } else {
      notification = this.errorNotificationStack.pop();
    }
    this.toastr.error(notification.message, notification.title, { disableTimeOut: true });
    this.notificationStack.clear();
  }

  clear(): void {
    this.notificationStack.clear();
    this.errorNotificationStack.clear();
  }

  notificationPending(): boolean {
    // console.log('notificationPending', !this.notificationStack.isEmpty());
    return !this.notificationStack.isEmpty();
  }
}
