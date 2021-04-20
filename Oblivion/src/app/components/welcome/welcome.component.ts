import { Component, AfterViewInit } from '@angular/core';

declare var anime: any;

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements AfterViewInit {

  constructor() {
  }

  ngAfterViewInit(): void {
    // Wrap every letter in a span
    const textWrapper = document.querySelector('.an-1');
    // @ts-ignore
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g,  "<span class='letter'>$&</span>");

    // @ts-ignores
    anime.timeline({loop: false})
      .add({
        targets: '.an-1 .letter',
        scale: [4, 1],
        opacity: [0, 1],
        translateZ: 0,
        easing: 'easeOutExpo',
        duration: 2000,
        delay: (el: any, i: number) => 100 * i
      }).add({
      targets: '.an-1',
      opacity: 1,
      duration: 3000,
      easing: 'easeOutExpo',
      delay: 1500
    });


  }
}
