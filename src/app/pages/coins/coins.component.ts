import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ProgressService } from '../../services/progress.service';
import { ChimeraService } from '../../services/chimera.service';

@Component({
  selector: 'app-coins',
  templateUrl: './coins.component.html',
  styleUrls: ['./coins.component.css']
})
export class CoinsComponent {
  coins: number;
  cars: number;
  bags: number;
  stacks: number;
  golds: number;
  silvers: number;

  constructor(
    progressService: ProgressService, 
    private location: Location, 
    private chimeraService: ChimeraService,
    private router: Router
  ) {
    this.coins = progressService.getCoins();
    this.cars = Math.floor(this.coins / 250);
    this.bags = Math.floor((this.coins % 250) / 50);
    this.stacks = Math.floor((this.coins % 50) / 10);
    this.golds = Math.floor((this.coins % 10) / 2);
    this.silvers = Math.floor(this.coins % 2);
  }

  numberToIterable(num: number) {
    return Array(num).fill('');
  }

  goBack() {
    this.location.back();
  }

  goPreviousPinfold() {
    let pinfoldStatus = this.chimeraService.getChimeraStatus();
    if (pinfoldStatus != null && pinfoldStatus.length != 0 ) {
      this.router.navigate(['pinfold'], {
        queryParams: { pinfoldNumber: pinfoldStatus[pinfoldStatus.length-1].caseId, zooId: pinfoldStatus[pinfoldStatus.length-1].zooId }
      });
    } else {
      var slideItems = [
        { src: '../../assets/img/backgrounds/chimera-zoo.png', id: 1 },
        { src: '../../assets/img/backgrounds/chimera-zoo.png', id: 2 },
        { src: '../../assets/img/backgrounds/chimera-zoo.png', id: 3 },
        { src: '../../assets/img/backgrounds/chimera-zoo.png', id: 4 },
        { src: '../../assets/img/backgrounds/chimera-zoo.png', id: 5 }
      ];
      for (let i = 0; i < slideItems.length; i++) {
        for(let j = 1; j < 8; j++) {
          var tempData = this.chimeraService.getChimeraAnimal('zoo-' + slideItems[i].id +'-' + j);
          if (tempData == null) {
            this.router.navigate(['pinfold'], {
              queryParams: { pinfoldNumber: j, zooId: slideItems[i].id }
            });
            return;
          } 
        }
      }
    }
  }
}
