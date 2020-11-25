import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChimeraService } from '../../services/chimera.service';
import { ProgressService } from '../../services/progress.service';
import { ChimeraAnimal } from '../../types/chimera-animal';
import {
  trigger,
  transition,
  animate,
  style,
  state
} from '@angular/animations';

const DUR = 1000;
const caseNumber = 8;

@Component({
  selector: 'app-chimera-zoo',
  templateUrl: './chimera-zoo.component.html',
  styleUrls: ['./chimera-zoo.component.css'],
  animations: [trigger("move", [
    state("forward", style({ transform: 'translateX(0)' })),
    state("backward", style({ transform: 'translateX(0)' })),
    state("backward-inactive", style({ transform: 'translateX(100%)' })),
    state("forward-inactive", style({ transform: 'translateX(-100%)' })),

    transition('forward => forward-inactive', [
      style({ transform: 'translateX(0)' }),
      animate(DUR, style({ transform: 'translateX(-100%)' }))
    ]),

    transition('forward-inactive => forward, backward-inactive => forward', [
      style({ transform: 'translateX(100%)' }),
      animate(DUR, style({ transform: 'translateX(0)' }))
    ]),

    transition('backward-inactive => backward, forward-inactive => backward', [
      style({ transform: 'translateX(-100%)' }),
      animate(DUR, style({ transform: 'translateX(0)' }))
    ]),

    transition('backward => backward-inactive, forward => backward-inactive', [
      style({ transform: 'translateX(0)' }),
      animate(DUR, style({ transform: 'translateX(100%)' }))
    ]),

    transition('backward => forward-inactive', [
      style({ transform: 'translateX(0)' }),
      animate(DUR, style({ transform: 'translateX(-100%)' }))
    ])

  ])]
})
export class ChimeraZooComponent implements OnInit {
  backGroundImg: String;
  pinfoldAnimals: ChimeraAnimal[][] = [];
  selectedAnimal: ChimeraAnimal;
  fullModal: HTMLElement;
  zooId: number;
  direction = 'forward';
  slideItems: any[];

  constructor(
    private router: Router,
    private location: Location,
    private chimeraService: ChimeraService,
    private progressService: ProgressService,
    private activatedRoute: ActivatedRoute
  ) { 
    this.backGroundImg = '../../assets/img/backgrounds/chimera-zoo.png';
    let temp = this.activatedRoute.snapshot.queryParamMap.get('zooId');
    if (temp == null) {
      this.zooId = 1;
    } else {
      this.zooId = parseInt(temp);
    }
    this.slideItems = [
      { src: '../../assets/img/backgrounds/chimera-zoo.png', id: 1 },
      { src: '../../assets/img/backgrounds/chimera-zoo.png', id: 2 },
      { src: '../../assets/img/backgrounds/chimera-zoo.png', id: 3 },
      { src: '../../assets/img/backgrounds/chimera-zoo.png', id: 4 },
      { src: '../../assets/img/backgrounds/chimera-zoo.png', id: 5 }
    ];

    for (let i = 0; i < this.slideItems.length; i++) {
      this.pinfoldAnimals[this.slideItems[i].id] = [];
    }
    for(let i = 1; i < 8; i++) {
      this.pinfoldAnimals[this.zooId][i] = this.chimeraService.getChimeraAnimal('zoo-' + this.zooId +'-' + i);
      if (this.pinfoldAnimals[this.zooId][i] == null) {
        this.pinfoldAnimals[this.zooId][i] = {
          id: 'zoo-' + this.zooId + '-'+i,
          zooid: 'zoo-' + this.zooId,
          head: '',
          body: '',
          tail: '',
          tailtype: '',
          completed: false
        }
      }
    }
  }
  
  ngOnInit() {
    this.setAnimals();
  }

  ngAfterViewInit() {
    this.fullModal = <HTMLElement>document.getElementById("fullModal");
  }

  goPinfold(pNumber, currentAnimal) {
    if (!currentAnimal.completed) {
      this.router.navigate(['pinfold'], {
        queryParams: { pinfoldNumber: pNumber, zooId: this.zooId }
      });
    } else {
      this.selectedAnimal = currentAnimal;
      this.fullModal.style.display = "block";
    }
  }

  goBack() {
    this.location.back();
  }

  goSnacks() {
    alert('Snacks!');
  }

  goGifts() {
    alert('Gifts!');
  }

  goForward() {
    if (this.zooId < this.slideItems.length) {
      this.zooId += 1;
      this.direction = 'forward';
      this.setAnimals();
    }
  }

  goBackward() {
    if (this.zooId > 1) {
      this.zooId = this.zooId - 1;
      this.direction = 'backward';
      this.setAnimals();
    }
  }

  setAnimals() {
    for(let i = 1; i < caseNumber; i++) {
      this.pinfoldAnimals[this.zooId][i] = this.chimeraService.getChimeraAnimal('zoo-' + this.zooId +'-' + i);
      if (this.pinfoldAnimals[this.zooId][i] == null) {
        this.pinfoldAnimals[this.zooId][i] = {
          id: 'zoo-' + this.zooId + '-'+i,
          zooid: 'zoo-' + this.zooId,
          head: '',
          body: '',
          tail: '',
          tailtype: '',
          completed: false
        }
      }
    }
  }

  goPreviousPinfold() {
    let pinfoldStatus = this.chimeraService.getChimeraStatus();
    if (pinfoldStatus != null && pinfoldStatus.length != 0 ) {
      this.router.navigate(['pinfold'], {
        queryParams: { pinfoldNumber: pinfoldStatus[pinfoldStatus.length-1].caseId, zooId: pinfoldStatus[pinfoldStatus.length-1].zooId }
      });
    } else {
      for (let i = 0; i < this.slideItems.length; i++) {
        var selected_zooId = this.slideItems[i].id;
        for(let j = 1; j < 8; j++) {
          var tempData = this.chimeraService.getChimeraAnimal('zoo-' + selected_zooId +'-' + j);
          if (tempData == null) {
            this.router.navigate(['pinfold'], {
              queryParams: { pinfoldNumber: j, zooId: selected_zooId }
            });
            return;
          }
        }
      }
    }
  }

  goQuiz() {
    let quizState = this.progressService.getQuizStatus();
    if (quizState != null && quizState.length != 0) {
      this.router.navigate(['/list-select'],
      { queryParams:
        {
          list : quizState.list,
          grade: quizState.grade,
          capital: quizState.capital,
          reordered: quizState.reordered,
          pre_category: quizState.pre_category
        }
      });
    } else {
      alert("There is no recent work history.");
    }
  }
}

window.onclick = function(event) {
  if (event.target == document.getElementById("fullModal")) {
    document.getElementById("fullModal").style.display = "none";
  }
}
