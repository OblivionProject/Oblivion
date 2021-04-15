import { Injectable } from '@angular/core';

export const WS_ENDPOINT = 'wss://localhost:8080' //'wss://oblivionchat.com/websocket/';//'wss://128.255.71.168:8080'; wss://localhost:8080

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {

  private webSocket: WebSocket;

  constructor() {
    console.log("MATHEW IT IS CREATED AGAIN!");
    this.webSocket = new WebSocket(WS_ENDPOINT);
  }

  public getWebSocket() {
    return this.webSocket;
  }

  // public setMessageHandler(): (this: WebSocket, ev: MessageEvent<any>) => any {
  //   return this.webSocket.onmessage;
  // }

  // public getWebSocket(): WebSocket {
  //   return this.webSocket;
  // }

  // Send data to the WebSocket TODO: Look into if this needs error handling
  // public send(data: string | SharedArrayBuffer | ArrayBuffer | Blob | ArrayBufferView): void {
  //   this.webSocket.send(data);
  // }

  // WebSocket close handler TODO: Make more robust (Allow parent class to assign like message handler?)
  // private onClose(closeEvent: CloseEvent): void {
  //   console.log(closeEvent);
  // }

  // WebSocket error handler TODO: Make more robust (Allow parent class to assign like message handler?)
  // private onError(event: Event): void {
  //   console.log(event);
  // }
}
