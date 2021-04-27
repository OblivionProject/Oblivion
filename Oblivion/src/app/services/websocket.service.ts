import { Injectable } from '@angular/core';

export const WS_ENDPOINT = 'wss://172.26.91.236:8080';//'wss://oblivionchat.com/websocket/';

@Injectable()
export class WebsocketService {

  private webSocket: WebSocket;

  constructor() {
    this.webSocket = new WebSocket(WS_ENDPOINT);
  }

  public getWebSocket() {
    return this.webSocket;
  }
}
