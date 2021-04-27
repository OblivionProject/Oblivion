import { Injectable } from '@angular/core';
import {TitleModel} from '../models/title.model';
import {Subject} from "rxjs";

enum Modes{
  SM,
  MD,
  LG
}

@Injectable()
export class VideoOrderingService {

  public video_tile_incrementer: number; // increment video array
  public video_start_index: number; //start index of remote video array
  public video_end_index: number; // end index of remote video array
  public video_mover_button_right: boolean; // enable buttons to shift videos right
  public video_mover_button_left: boolean; // enable buttons to shift videos left
  public mode: Modes | undefined; // if only 1 video at a time
  public videos_count: number; // number of remote videos
  public tiles: TitleModel;
  public isRightButtonShown: Subject<any> = new Subject<any>();
  public isLeftButtonShown: Subject<any> = new Subject<any>();
  public isTileChange: Subject<any> = new Subject<any>();
  public height: any;
  public showChat: boolean;

  constructor() {
    this.video_start_index = 0;
    this.video_end_index = 1;
    this.video_tile_incrementer = 1;
    this.video_mover_button_right = false;
    this.video_mover_button_left = false;
    this.videos_count = 0;
    this.tiles = new TitleModel(4,1);
    this.showChat = false;
  }

  public setVideosSizing(windowWidth:number): void{
    if (windowWidth <= 640){
      this.mode = Modes.SM;
      this.video_tile_incrementer = 1;
      this.adjustTileOrderOnResize();
      this.adjustViewOnResize(this.showChat);
    }

    //medium window sizes
    else if(windowWidth <= 1024 && windowWidth > 640){
      if(this.showChat){
        this.mode = Modes.SM;
        this.video_tile_incrementer = 1;
      }
      else{
        this.mode = Modes.MD;
        this.video_tile_incrementer = 2;
      }

      this.adjustTileOrderOnResize();
      this.adjustViewOnResize(false);
    }

    //large window sizes
    else{
      if(this.showChat){
        this.mode = Modes.MD;
        this.video_tile_incrementer = 2;
      }
      else{
        this.mode = Modes.LG;
        this.video_tile_incrementer = 4;
      }
      this.adjustTileOrderOnResize();
      this.adjustViewOnResize(false);
    }
  }

  public moveRight():void{
    let new_start_index = this.video_start_index + this.video_tile_incrementer;
    let new_end_index = this.video_end_index + this.video_tile_incrementer;
    this.updateLeft(true);

    switch (this.mode){
      case Modes.SM:
        this.video_start_index = new_start_index;
        this.video_end_index = new_end_index;
        break;
      default:
        if(new_end_index > this.videos_count){
          this.video_end_index = this.videos_count;
          this.video_start_index = this.video_end_index - this.video_tile_incrementer;
        }
        break;
    }
    if(this.video_end_index == this.videos_count){
      this.updateRight(false);
    }
  }

  public moveLeft():void{
    let new_start_index = this.video_start_index - this.video_tile_incrementer;
    let new_end_index = this.video_end_index - this.video_tile_incrementer;
    this.updateRight(true);

    switch (this.mode) {
      case Modes.SM:
        this.video_start_index = new_start_index;
        this.video_end_index = new_end_index;
        break;
      default:
        if (new_start_index < 0) {
          this.video_start_index = 0;
          this.video_end_index = this.video_start_index + this.video_tile_incrementer;
        }
        break;
    }

    //disable left button when at beginning of list
    if(this.video_start_index == 0){
      this.updateLeft(false);
    }
  }

  public setTiles():void{
    switch(this.mode){
      case Modes.SM:
        this.tiles.setOdd();
        this.isTileChange.next(this.tiles);
        break;
      case Modes.MD:
        if(this.videos_count == 1){
          this.tiles.setOdd();
        }
        else{
          this.tiles.setEven();
        }
        this.isTileChange.next(this.tiles);
        break;
      case Modes.LG:
        if(this.videos_count == 1){
          this.tiles.setOdd();
        }
        else if(this.videos_count == 2 ){
          this.tiles.setEven();
        }
        else{
          this.tiles.setLarge();
        }
        this.isTileChange.next(this.tiles);
        break;
      default:
        break;
    }
  }

  public updateLeft(value: boolean):void{
    this.video_mover_button_left = value;
    this.isLeftButtonShown.next(this.video_mover_button_left);
  }

  public updateRight(value: boolean): void{
    this.video_mover_button_right = value;
    this.isRightButtonShown.next(this.video_mover_button_right);
  }

  public adjustTileOrderOnResize():void{
    let possible_new_end_index = this.video_start_index + this.video_tile_incrementer;
    if(possible_new_end_index <= this.videos_count){
      this.video_end_index = possible_new_end_index;
    }
    else{
      this.video_end_index = this.videos_count;
      let possible_new_start_index = this.video_end_index - this.video_tile_incrementer;
      if(possible_new_start_index < 0){
        this.video_start_index = 0;
      }
      else{
        this.video_start_index = possible_new_start_index;
      }
    }
  }

  public adjustViewOnResize(hideButton:boolean){
    if (this.videos_count > this.video_tile_incrementer) {
      if(this.video_start_index==0 || hideButton){
        this.updateLeft(false);
      }
      else{
        this.updateLeft(true);
      }
      if(this.video_end_index==this.videos_count || hideButton){
        this.updateRight(false);
      }
      else{
        this.updateRight(true);
      }
    }
    else{
      this.updateLeft(false);
      this.updateRight(false);
    }
  }

  public dynamicHeightSizer(height:number):number{
    if(this.tiles.cols == 2 && this.tiles.rows == 2 && this.videos_count > 2){
      return height/2;
    }
    else{
      return height;
    }
  }

  public setMessageWidth(width:number):number{
    switch(this.mode) {
      case Modes.SM:
        if (width <= 640){
          return width;
        }
        else{
          return width/2;
        }
      case Modes.MD:
        if (width <= 1024 && width > 640){
          return width/2;
        }
        else{
          return width/3;
        }
      case Modes.LG:
          return width/3;
      default:
        return width / 3;
    }
  }

  public dynamicWidthSizer(height:number): number{
    if(this.mode == Modes.SM){
      return (4*height)/3;
    }
    else{
      return (16*height)/9;
    }
  }
}
