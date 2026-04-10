import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class Signalr {
  private hubConnection!: signalR.HubConnection;

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5231/hub', {
        withCredentials: true, // 🔥 important for cookies
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch((err) => console.log('Error while starting connection: ' + err));
  }

  stopConnection() {
    this.hubConnection?.stop();
  }

  on(eventName: string, callback: (data: any) => void) {
    this.hubConnection.on(eventName, callback);
  }

  off(eventName: string) {
    this.hubConnection.off(eventName);
  }
}
