import { TestBed } from '@angular/core/testing';

import { ThemeHelperService } from './theme-helper.service';

describe('ThemeHelperService', () => {
  let service: ThemeHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
