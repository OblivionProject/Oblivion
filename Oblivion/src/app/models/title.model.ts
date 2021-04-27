export class TitleModel {
  cols?: number;
  rows?: number;
  text?: string;
  border?: string;
  video?: string;
  name?: string;

  constructor(columns:number, rows:number) {
    this.cols = columns;
    this.rows = rows;
  }

  public setOdd(){
    this.cols = 2;
    this.rows = 1;
  }

  public setEven(){
    this.cols = 1;
    this.rows = 1;
  }

  public setLarge(){
    this.cols = 1;
    this.rows = 1;
  }
}
