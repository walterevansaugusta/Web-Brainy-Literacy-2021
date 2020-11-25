import { Component } from '@angular/core';

@Component({
  templateUrl: 'phoneme-categories.component.html',
  styleUrls: ['phoneme-categories.component.css']
})
export class PhonemeCategoriesComponent {
  category: HTMLAudioElement;
  hovering: boolean;
  timer: any;

  playAudio(event: any) {
    this.hovering = true;
    this.timer = setTimeout(() => {
      if (this.hovering) {
        this.category = new Audio();
        this.category.src = '/assets/audio/buttons/' + event.target.id + '.mp3';
        if (this.category.src !== undefined) {
          this.category.load();
          this.category.play();
        }
      }
    }, 400);
  }

  stopAudio() {
    this.hovering = false;
    if (this.category !== undefined) {
      this.category.pause();
      this.category.currentTime = 0.0;
    }
    clearTimeout(this.timer);
  }
}
