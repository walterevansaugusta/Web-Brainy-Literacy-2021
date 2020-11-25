import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ChimeraService } from '../../services/chimera.service';
import { delay } from 'q';
import { ChimeraAnimal } from '../../types/chimera-animal';
import { ProgressService } from '../../services/progress.service';
import {
  animate,
  style,
  transition,
  trigger,
  state
} from "@angular/animations";

const headCoin = 3;
const bodyCoin = 2;
const tailCoin = 1;
const flippedCoin = 4;

@Component({
  selector: 'app-pinfold',
  templateUrl: './pinfold.component.html',
  styleUrls: ['./pinfold.component.css'],
  animations: [
    trigger("slideInOut", [
      state(
        "in",
        style({
          width: "10%",
          height: "98%",
          margin: "0px 0px"
        })
      ),
      state(
        "out",
        style({
          width: "15%",
          height: "98%",
          margin: "0px 2%"
        })
      ),
      state(
        "collapse",
        style({
          width: "0%",
          height: "98%",
          margin: "0px 0px"
        })
      ),
      transition("in => out", animate("1500ms ease-in-out")),
      transition("in => collapse", animate("1500ms ease-in-out")),
      transition("collapse => in", animate("1500ms ease-in-out")),
      transition("collapse => out", animate("1500ms ease-in-out")),
      transition("out => collapse", animate("1500ms ease-in-out")),
      transition("out => in", animate("1500ms ease-in-out"))
    ])
  ]
})
export class PinfoldComponent implements OnInit {
  pinfoldNumber: string;
  zooId: string;
  chimeraAnimals: any;
  selectedAnimals: any;
  modal: HTMLElement;
  modalState: boolean;
  chimeraAnimal: ChimeraAnimal;
  selectedHeadState: boolean;
  selectedBodyState: boolean;
  selectedTailState: boolean;
  totalCoin: number;
  restCoin: number;
  incorrectAudio: HTMLAudioElement;
  stepValue: number;
  chimeraStatus: any;
  isTail: boolean;
  isFlipped: boolean;
  completeChimeraAnimal: string;
  emptyTail: string;
  emptyFlipped: string;

  constructor(
    private chimeraService: ChimeraService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private router: Router,
    private ngZone: NgZone,
    private progressService: ProgressService,
  ) {
    this.pinfoldNumber = this.activatedRoute.snapshot.queryParamMap.get('pinfoldNumber');
    this.zooId = 'zoo-' + this.activatedRoute.snapshot.queryParamMap.get('zooId');
    this.chimeraAnimals = this.chimeraService.dataLoad();
    this.chimeraAnimal = this.chimeraService.getChimeraAnimal(this.zooId + '-' + this.pinfoldNumber);
    this.chimeraStatus = this.chimeraService.getChimeraStatus();
    if (this.chimeraStatus == undefined) {
      this.chimeraStatus = [];
    }
    this.stepValue = 6;
    if (this.chimeraAnimal == null) {
      this.chimeraAnimal = {
        id: this.zooId+'-'+this.pinfoldNumber,
        zooid: this.zooId,
        head: 'transparent.png',
        body: 'transparent.png',
        tail: 'transparent.png',
        tailtype: '',
        completed: false
      };
    }
    this.selectedAnimals = this.selectAnimals();
    this.selectedHeadState = this.chimeraAnimal.head !== 'transparent.png'? true: false;
    this.selectedBodyState = this.chimeraAnimal.body !== 'transparent.png'? true: false;
    this.selectedTailState = this.chimeraAnimal.tail !== 'transparent.png'? true: false;
    this.totalCoin = Math.floor(this.progressService.getCoins() / 2);
    this.restCoin = this.progressService.getCoins() - this.totalCoin * 2;
    this.isTail = this.chimeraAnimal.tailtype == 'tail'? true: false;
    this.isFlipped = this.chimeraAnimal.tailtype == 'flipped'? true: false;
    this.completeChimeraAnimal = "out";
    this.emptyTail = "out";
    this.emptyFlipped = "out";
  }

  ngOnInit() {
    this.incorrectAudio = new Audio();
    this.incorrectAudio.src = '/assets/audio/incorrect_answer_sound.mp3';
    this.incorrectAudio.load();
    if (this.chimeraAnimal.head !== 'transparent.png') {
      document.getElementById("head-coin").style.visibility = 'hidden';
    }
    if (this.chimeraAnimal.body !== 'transparent.png') {
      document.getElementById("body-coin").style.visibility = 'hidden';
    }
    if (this.chimeraAnimal.tail !== 'transparent.png') {
      if (this.chimeraAnimal.tailtype === 'tail') {
        document.getElementById("tail-coin").style.visibility = 'hidden';
      } else {
        document.getElementById("flipped-coin").style.visibility = 'hidden';
      }
    }
  }

  ngAfterViewInit() {
    this.modal = document.getElementById("myModal");
  }

  goBack() {
    this.location.back();
  }

  getRandomInt(max) {
    let tempIndex = [];
    let i = 0;
    do {
      let sel_ind = Math.floor(Math.random() * Math.floor(max));
      if (!tempIndex.includes(sel_ind)) {
        tempIndex.push(sel_ind);
        i++;
      }
  } while ( i < this.stepValue)
    return tempIndex;
  }

  selectAnimals() {
    let temp = [];
    let cnt = this.chimeraAnimals.length;
    let sel_inds = this.getRandomInt(cnt);
    for (let i = 0; i < sel_inds.length; i++) {
      if (this.chimeraAnimals[sel_inds[i]].head.file == this.chimeraAnimal.head) {
        this.chimeraAnimals[sel_inds[i]].head.state = true;
      } else {
        this.chimeraAnimals[sel_inds[i]].head.state = false;
      }
      if (this.chimeraAnimals[sel_inds[i]].body.file == this.chimeraAnimal.body) {
        this.chimeraAnimals[sel_inds[i]].body.state = true;
      } else {
        this.chimeraAnimals[sel_inds[i]].body.state = false;
      }
      if (this.chimeraAnimals[sel_inds[i]].tail.file == this.chimeraAnimal.tail) {
        this.chimeraAnimals[sel_inds[i]].tail.state = true;
      } else {
        this.chimeraAnimals[sel_inds[i]].tail.state = false;
      }
      if (this.chimeraAnimals[sel_inds[i]].flipped.file == this.chimeraAnimal.tail) {
        this.chimeraAnimals[sel_inds[i]].flipped.state = true;
      } else {
        this.chimeraAnimals[sel_inds[i]].flipped.state = false;
      }
      temp.push(this.chimeraAnimals[sel_inds[i]]);
    }
    return temp;
  }

  openModal() {
    document.getElementById("preview-section").style.visibility = 'hidden';
    document.getElementById("coin-section").style.visibility = 'hidden';
    this.modal.style.display = "block";
    delay(3000).then(() => {
      this.modal.style.display = "none";
      this.ngZone.run(() => this.router.navigate(['/chimera-zoo'],{
        queryParams: { zooId: this.activatedRoute.snapshot.queryParamMap.get('zooId') }
      })).then();
    })
  }

  changeSelectedAnimal(selectedId, type) {
    for (let i = 0; i < this.selectedAnimals.length; i++) {
      if (this.selectedAnimals[i].id == selectedId) {
        if (type == 'head') {
          this.selectedAnimals[i].head.state = true;
        } else if (type == 'body') {
          this.selectedAnimals[i].body.state = true;
        } else if (type == 'tail') {
          this.selectedAnimals[i].tail.state = true;
        } else {
          this.selectedAnimals[i].flipped.state = true;
        }
      }
    }
  }

  selectHead(animal, animalId) {
    if (this.totalCoin < headCoin) {
      this.incorrectAudio.play();
    } else {
      if (!this.selectedHeadState) {
        this.totalCoin = this.totalCoin - headCoin;
        this.chimeraAnimal.head = animal;
        document.getElementById("head-coin").style.visibility = 'hidden';
        this.selectedHeadState = true;
        this.changeSelectedAnimal(animalId, 'head');
        this.progressService.saveCoin(this.totalCoin * 2 + this.restCoin);
        this.saveAnimal();
        this.checkAnimal();
      }
    }
  }

  selectBody(animal, animalId) {
    if (this.totalCoin < bodyCoin) {
      this.incorrectAudio.play();
    } else {
      if (!this.selectedBodyState) {
        this.totalCoin = this.totalCoin - bodyCoin;
        this.chimeraAnimal.body = animal;
        document.getElementById("body-coin").style.visibility = 'hidden';
        this.selectedBodyState = true;
        this.changeSelectedAnimal(animalId, 'body');
        this.progressService.saveCoin(this.totalCoin * 2 + this.restCoin);
        this.saveAnimal();
        this.checkAnimal();
      }
    }
  }

  selectTail(animal, animalId, type) {
    if (this.totalCoin < tailCoin && type === "tail") {
      this.incorrectAudio.play();
    } else if (this.totalCoin < flippedCoin && type === "flipped") {
      this.incorrectAudio.play();
    } else {
      if (!this.selectedTailState) {
        this.chimeraAnimal.tail = animal;
        this.chimeraAnimal.tailtype = type;
        if (type === "tail") {
          this.isTail = true;
          document.getElementById("tail-coin").style.visibility = 'hidden';
          this.totalCoin = this.totalCoin - tailCoin;
        } else {
          this.isFlipped = true;
          document.getElementById("flipped-coin").style.visibility = 'hidden';
          this.totalCoin = this.totalCoin - flippedCoin;
        }
        this.selectedTailState = true;
        this.changeSelectedAnimal(animalId, type);
        this.progressService.saveCoin(this.totalCoin * 2 + this.restCoin);
        this.saveAnimal();
        this.checkAnimal();
      }
    }
  }

  checkAnimal() {
    if (this.selectedHeadState && this.selectedBodyState && this.selectedTailState) {
      this.chimeraAnimal.completed = true;
      let zoo_id = this.zooId.split('-')[1];
      for (let i = 0; i <this.chimeraStatus.length; i++) {
        if (this.chimeraStatus[i].zooId == zoo_id && this.chimeraStatus[i].caseId == this.pinfoldNumber) {
          this.chimeraStatus.splice(i, 1);
        }
      }
      this.chimeraService.saveChimeraStatus(this.chimeraStatus);
      this.saveAnimal();
      this.completeChimeraAnimal = "in";
      if (this.isFlipped) {
        this.emptyFlipped = "in";
        this.emptyTail = "collapse";
      } else {
        this.emptyTail = "in";
        this.emptyFlipped = "collapse";
      }
      delay(1500).then(() => {
        this.openModal();
      })
    } else {
      let zoo_id = this.zooId.split('-')[1];
      if (this.chimeraStatus.length > 0) {
        let tempValue = {
          zooId: zoo_id,
          caseId: this.pinfoldNumber,
          state: false
        };
        const found = this.chimeraStatus.find(element => element.zooId == zoo_id && element.caseId == this.pinfoldNumber);
        if (found == null) {
          this.chimeraStatus.push(tempValue);
        }
      } else {
        this.chimeraStatus.push({
          zooId: zoo_id,
          caseId: this.pinfoldNumber,
          state: false
        });
      }
      this.chimeraService.saveChimeraStatus(this.chimeraStatus);
    }
  }

  saveAnimal() {
    this.chimeraService.saveChimeraAnimal(this.zooId+'-'+this.pinfoldNumber, this.chimeraAnimal);
  }

  goQuiz() {
    let quizState = this.progressService.getQuizStatus();
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
  }
  
  onAnimation() {
    this.completeChimeraAnimal = "in";
    if (this.isFlipped) {
      this.emptyFlipped = "in";
      this.emptyTail = "collapse";
    } else {
      this.emptyTail = "in";
      this.emptyFlipped = "collapse";
    }
    delay(1500).then(() => {
      // this.openModal();
    })
  }
}
