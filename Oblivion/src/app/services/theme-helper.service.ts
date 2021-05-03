import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeHelperService {

  public darkmode: boolean

  constructor() {
    this.darkmode = false;
  }
}
