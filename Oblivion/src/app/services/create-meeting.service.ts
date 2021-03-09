import { Injectable } from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import {Meeting} from '../models/meeting.model';
import {Subject} from 'rxjs';
import {webSocket} from 'rxjs/webSocket';

export const WS_ENDPOINT = 'ws://localhost:8080'; //'ws://172.28.204.8:8080';//'ws://localhost:8080'; // TODO: Config file for this?

@Injectable({
  providedIn: 'root'
})


export class CreateMeetingService {

  private socket$!: WebSocketSubject<Meeting>;

  private messagesSubject = new Subject<Meeting>();

  public messsage$ = this.messagesSubject.asObservable();

  constructor() { }

  public connect(): void{
    this.socket$ = this.getNewWebSocket();

    this.socket$.subscribe(
      msg => {
        console.log('Received message of type:' + msg.title);
        this.messagesSubject.next(msg);
      }
    );
  }

  public disconnect(): void{
    this.socket$.unsubscribe();
  }

  sendMessage(msg: Meeting): void {
    console.log('Sending Message:' + msg.title);
    this.socket$.next(msg);
  }

  private getNewWebSocket(): WebSocketSubject<any> {
    return webSocket({
      url : WS_ENDPOINT,
      openObserver: {
        next: () => {
          console.log('DataService: connection OK');
        }
      },
      closeObserver: {
        next: () => {
          console.log('DataService: connection Closed');
          // this.socket$ = null;
          //this.connect(); // try to reconnect TODO: Ask Joe why this is here
        }
      }
    });
  }
}

