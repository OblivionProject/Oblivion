import { Injectable } from '@angular/core';

export const WS_ENDPOINT = 'wss://oblivionchat.com/websocket/';

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
