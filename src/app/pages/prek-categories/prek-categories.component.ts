import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Inject } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';

@Component({
  templateUrl: 'prek-categories.component.html',
  styleUrls: ['prek-categories.component.css']
})
export class PrekCategoriesComponent {
  category: HTMLAudioElement;

  constructor(
    @Inject(SESSION_STORAGE) private storage: WebStorageService,
    private location: Location
  ) {}

  ngOnInit() {
    this.storage.set('unit', 'PRE-K');
  }

  playAudio(event: any) {
    event.preventDefault();
    // this.category = new Audio();
    // this.category.src = '/assets/audio/buttons/' + event.target.id + '.mp3';
    // if (this.category.src !== undefined) {
    //     this.category.load();
    //     this.category.play();
    // }
  }

  goBack() {
    this.location.back();
  }
}
