import {ElementRef} from '@angular/core';
import {MediaService} from '../services/media.service';
export class TitleModel {
  cols?: number;
  rows?: number;

  constructor(columns:number, rows:number) {
    this.cols = columns;
    this.rows = rows;
  }

  public setOdd(){
    this.cols = 4;
    this.rows = 1;
  }

  public setEven(){
    this.cols = 2;
    this.rows = 1;
  }

  public setLarge(){
    this.cols = 2;
    this.rows = 2;
  }

}
