import { Component } from '@angular/core';
import { Location } from '@angular/common';

import { Inject } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';

@Component({
  templateUrl: 'third-categories.component.html',
  styleUrls: ['third-categories.component.css']
})
export class ThirdCategoriesComponent {
  category: HTMLAudioElement;
  hovering: boolean;
  timer: any;

  constructor(
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private location: Location
  ) {}

  ngOnInit() {
    this.storage.set('unit', 'Third-Grade');
  }

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

  goBack() {
    this.location.back();
  }
}
