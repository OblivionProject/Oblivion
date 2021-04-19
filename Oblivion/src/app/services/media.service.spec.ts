import { TestBed } from '@angular/core/testing';

import { MediaService } from './media.service';
import {WebsocketService} from "./websocket.service";

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MediaService,WebsocketService]
    });
    service = TestBed.inject(MediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
