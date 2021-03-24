import { Injectable } from '@angular/core';
import {Message} from "@angular/compiler/src/i18n/i18n_ast";
import {MediaService} from "./media.service";

export const WS_ENDPOINT = 'wss://oblivionchat.com/websocket/';//'wss://128.255.71.168:8080';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private webSocket: WebSocket;

  constructor() {
    this.webSocket = new WebSocket(WS_ENDPOINT);
    // this.webSocket.onclose   = this.onClose;
    // this.webSocket.onerror   = this.onError;
  }

  // WebSocket message handler. This must be set by the outer class
  // public setMessageHandler(messageHandler: ((this:WebSocket, ev: MessageEvent) => any) | null): void { // handler: (this: WebSocket, ev: MessageEvent<any>) => any
  //   this.webSocket.onmessage = messageHandler;
  // }

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
