import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Toast {
  private success = new BehaviorSubject<boolean>(false);
  private title = new BehaviorSubject<string | null>(null);
  private message = new BehaviorSubject<string | null>(null);

  success$: Observable<boolean> = this.success.asObservable();
  title$: Observable<string | null> = this.title.asObservable();
  message$: Observable<string | null> = this.message.asObservable();

  showToast(success: boolean, title: string, message: string): void {
    this.success.next(success);
    this.title.next(title);
    this.message.next(message);

    setTimeout(() => {
      this.clearToast();
    }, 5000);
  }

  clearToast(): void {
    this.success.next(false);
    this.title.next(null);
    this.message.next(null);
  }
  
}
