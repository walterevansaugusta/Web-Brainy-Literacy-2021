import {Injectable, Inject} from '@angular/core';
import {SESSION_STORAGE, WebStorageService} from 'angular-webstorage-service';
import {Component, OnDestroy, OnInit, AfterViewInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {delay} from 'q';
import {TransferLetterService} from '../../services/transfer-letter-service.service';
import {ProgressService} from '../../services/progress.service';
import {AlphabetLettersService} from '../../services/alphabet-letters.service';
import { Location } from '@angular/common';
import {AlphabetLetter} from '../../types/alphabet-letter';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

@Component({
    templateUrl: 'alphabet-quiz.component.html',
    styleUrls: ['alphabet-quiz.component.css']
})

export class AlphabetQuizComponent implements OnInit, OnDestroy, AfterViewInit {
    letterAnimate1: boolean;
    letterAnimate2: boolean;
    letterAnimate3: boolean;
    letterAnimate4: boolean;

    letterPlayAudio: boolean;
    letterAudio: HTMLAudioElement;
    correctSound: HTMLAudioElement;
    incorrectAudio: HTMLAudioElement;

    letter: AlphabetLetter;
    letterList: AlphabetLetter[];
    isFirstAttempt: boolean;

    quizAll: string;
    capital: string;
    key: number;
    hasGuessed: boolean;
    pre_category: string;

    ex1: AlphabetLetter;
    ex2: AlphabetLetter;
    ex3: AlphabetLetter;
    ex4: AlphabetLetter;

    numberOfAttempts: number;
    correctOfAttempts: number;
    answerStartTime: number;

    ball: HTMLElement;
    angle: number;
    x: number;
    y: number;
    w: number;
    h: number;
    bankAnimation: boolean;

    goldStarImg: String;
    silverStarImg: String;
    starStatus: string[] = [];
    starIndex: number;

    constructor(
        @Inject(SESSION_STORAGE) private storage: WebStorageService, 
        private transferService: TransferLetterService,
        private letterProgressService: ProgressService,
        private alphabetLettersService: AlphabetLettersService,
        private router: Router,
        private location: Location,
        private activatedRoute: ActivatedRoute,
        private http: HttpClient,
    ) {
        this.quizAll = this.activatedRoute.snapshot.queryParamMap.get('quizAll');
        this.capital = this.activatedRoute.snapshot.queryParamMap.get('capital');
        this.pre_category = this.activatedRoute.snapshot.queryParamMap.get('pre_category');
        if (this.pre_category == null) {
            this.pre_category = 'normal';
        }
        this.letterList = this.alphabetLettersService.dataImport(false);

        if (this.quizAll === 'true') {
            var key = Math.floor(Math.random() * 25);
            this.key = key;
            this.letter = this.letterList[key] as AlphabetLetter;
        } else {
            this.letter = this.transferService.getData() as AlphabetLetter;
        }

        if (!this.letter) {
            this.router.navigateByUrl('/alphabet-list-all');
        }

        // animation
        this.letterAnimate1 = false;
        this.letterAnimate2 = false;
        this.letterAnimate3 = false;
        this.letterAnimate4 = false;

        // audio
        this.letterPlayAudio = true;

        // Analytics
        this.numberOfAttempts = 0;
        this.correctOfAttempts = 0;
        this.answerStartTime = 0;
        this.ball = null;
        this.angle = 0;
        this.x = 0;
        this.y = 0;
        this.w = window.innerWidth / 2 - 2 * 3.8 * window.innerHeight / 100;
        this.h = window.innerHeight - 10 * window.innerHeight / 100;
        this.bankAnimation = false;

        this.goldStarImg = '../../assets/img/progress/Gold-Star-Blank.png';
        this.silverStarImg = '../../assets/img/progress/Silver-Star-Blank.png';
        
        this.starIndex = this.letterProgressService.getGoldStarsFromKey("letter" + '_' + this.pre_category + '_' + this.letter.letter);
        if (this.starIndex == 0) {
            this.starStatus = [];
        } else {
            for(let i = 0; i < this.starIndex; i++) {
                this.starStatus.push('gold');
            }
        }
    };

    ngOnInit() {
        //sound for correct answer choice
        this.correctSound = new Audio();
        this.correctSound.src = `/assets/audio/buttons/correct.mp3`;
        this.incorrectAudio = new Audio();
        this.incorrectAudio.src = '/assets/audio/incorrect_answer_sound.mp3';
        this.incorrectAudio.load();

        this.letterAudio = new Audio();
        this.letterAudio.src = `/assets/audio/letters/${this.letter.audio}`;
        this.letterAudio.load();
        this.letterAudio.onended = () => {
            this.letterAnimate1 = false;
            this.letterAnimate2 = false;
            this.letterAnimate3 = false;
            this.letterAnimate4 = false;
        };

        this.setPane();

        this.playAudio();
        this.isFirstAttempt = true;
        this.hasGuessed = false;
        
        //randomized randomExamples
        this.loadNew();
    }

    ballCircle() {
        this.ball.style.display = 'block';
        this.x = this.w + 3.8 * window.innerHeight / 100 + this.w * Math.cos(this.angle * Math.PI / 180);
        this.y = this.h - this.h * Math.sin(this.angle * Math.PI / 180);
        
        this.ball.style.left = this.x + 'px';
        this.ball.style.top = this.y + 'px';

        this.angle++;
        if (this.angle > 180) {
            this.angle = 0;
            this.ball.style.display = 'none';
            var bankObject = document.getElementById('bank');
            bankObject.classList.add('bank-animation');
            delay(600).then(() => {
                bankObject.classList.remove('bank-animation');
            })
            return;
        }
        setTimeout (() => {
            this.ballCircle();
        }, 10);
    }

    ngAfterViewInit() {
        if (this.capital) {
            var temp = <HTMLElement> document.getElementById('main-body');
            temp.style.textTransform = 'uppercase';
        }
        this.ball = <HTMLElement> document.getElementById('ball');
    }

    ngOnDestroy() {
        this.letterAudio.pause();
        this.letterAudio = null;
    }

    check(selected : AlphabetLetter, index) {
        if (selected === this.letter) {
            this.correctAnswer(selected);
            this.setPane();
        } else {
            this.incorrectAnswer(index);
        }
    }

    resetStarStatus() {
        const goldStarNum = this.letterProgressService.getGoldStarsFromKey("letter" + '_' + this.pre_category + '_' + this.letter.letter);
        if (goldStarNum > 0 && goldStarNum < 5) {
            for (let i = 0; i < goldStarNum; i++) {
                this.starStatus[i] = 'silver';
                this.letterProgressService.saveStarsToKey("letter" + '_' + this.pre_category + '_' + this.letter.letter + "gold", -1);
            }
        }
    }

    correctAnswer(correct : AlphabetLetter) {
        this.numberOfAttempts++;
        this.correctOfAttempts = this.numberOfAttempts;
        if (this.numberOfAttempts == 1) {
            if (this.starIndex < 5) {
                this.starStatus[`${this.starIndex}`] = 'gold';
                this.letterProgressService.saveStarsToKey("letter" + '_' + this.pre_category + '_' + this.letter.letter + "gold", 1);
                this.starIndex++;
            }
            this.ball.style.backgroundImage = `url('../../../assets/img/rewards/gold_coin.jpg')`;
            this.ballCircle();
            delay(500).then(() => {
                this.bankAnimation = false;
            })
            this.numberOfAttempts = 0;
            this.letterProgressService.addCoins("letter" + '_' + this.pre_category + '_' + this.letter.letter, 2);
        } else if (this.numberOfAttempts == 2) {
            this.starIndex = 0;
            this.resetStarStatus();
            this.ball.style.backgroundImage = `url('../../../assets/img/rewards/silver_coin.png')`;
            this.ballCircle();
            delay(500).then(() => {
                this.bankAnimation = false;
            })
            this.numberOfAttempts = 0;
            this.letterProgressService.addCoins("letter" + '_' + this.pre_category + '_' + this.letter.letter, 1);
            this.hasGuessed = false;
        } else {
            this.starIndex = 0;
            this.resetStarStatus();
            this.numberOfAttempts = 0;
            this.hasGuessed = false;
        }

        if (correct == this.ex1) {
            this.letterAnimate1 = true;
        } else if (correct == this.ex2) {
            this.letterAnimate2 = true;
        } else if (correct == this.ex3) {
            this.letterAnimate3 = true;
        } else {
            this.letterAnimate4 = true;
        }

        this.correctSound.onended = () => {
            this.letterAnimate1 = false;
            this.letterAnimate2 = false;
            this.letterAnimate3 = false;
            this.letterAnimate4 = false;
            this.correctSound.onended = () => {
                this.letterAnimate1 = false;
                this.letterAnimate2 = false;
                this.letterAnimate3 = false;
                this.letterAnimate4 = false;
            };
        };

        // Choose new random alphabet
        if (this.quizAll) {
            var key = Math.floor(Math.random() * 25);
            this.key = key;
            this.letter = this.letterList[key] as AlphabetLetter;

            this.letterAudio.src = `/assets/audio/letters/${this.letter.audio}`;
        }

        delay(300).then(() => {
            this.correctSound.play();
            delay(1000).then(() => {
                this.loadNew();
            });
        });

        delay(2000).then(() => {
            this.playAudio();
        });
        

        this.submitAnalyticEvent(this.letter.letter).subscribe(r => console.log(r));
    }

    incorrectAnswer(elementIndex) {
        this.starIndex = 0;
        this.resetStarStatus();
        this.incorrectAudio.play();
        var selectedObj = null;
        if (elementIndex == 1) {
            selectedObj = document.getElementById(`letter`);
        } else {
            selectedObj = document.getElementById(`letter${elementIndex}`);
        }
        selectedObj.style.visibility = 'hidden';
        this.numberOfAttempts++

        if (!this.hasGuessed) {
            this.hasGuessed = true;
            this.isFirstAttempt = false;
        }
        this.letterProgressService.addIncorrectAnswer('letter' + '_' + this.pre_category + '_' + this.letter.letter);
        if (this.numberOfAttempts % 2 == 0) {
            if (this.quizAll === 'true') {
                this.letter = this.letterList[this.key] as AlphabetLetter;
            } else {
                this.letter = this.transferService.getData() as AlphabetLetter;
            }
            this.incorrectAudio.onended = () => {
                this.ngOnInit();
                this.loadNew();
            };
        }
    }

    loadNew() {
        var randomExamples = this.pickRandom(this.letter);
        randomExamples.push(this.letter);
        
        randomExamples.sort(() => Math.random() - 0.5);
        
        this.ex1 = randomExamples[0];
        this.ex2 = randomExamples[1];
        this.ex3 = randomExamples[2];
        this.ex4 = randomExamples[3];
        
        this.isFirstAttempt = true;

        // Analytics
        this.answerStartTime = Date.now();
    }

    submitAnalyticEvent(letter) {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.storage.get('token')}`
        })

        return this.http.post('https://teacherportal.hearatale.com/api/analytics/application', {
            student: this.storage.get('user_id'),
            program: '5f087dc650084d0851a04b5b',
            focus_item_name: `alphabet_${this.pre_category}_${letter}`,
            focus_item_unit: this.storage.get('unit'),
            focus_item_subunit: "alphabet",
            time_spent: Date.now() - this.answerStartTime,
            correct_on: this.correctOfAttempts,
        }, {
            headers,
        });
    }

    pickRandom(current : AlphabetLetter) {
        var copiedList = [...this.letterList];

        // remove selected alphabet from list
        const index = copiedList.map(e => e.letter).indexOf(current.letter);
        copiedList.splice(index, 1);

        // create list of 3 unique randomized examples
        var n = 3;
        var result = new Array(n),
        len = copiedList.length,
        taken = new Array(len);

        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = copiedList[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    playAudio() {
        this.letterAudio.play();
    }

    goBack() {
        this.location.back();
    }

    setPane() {
        for (let i = 1; i < 5; i++) {
            var selectedObj = null;
            if (i == 1) {
                selectedObj = document.getElementById(`letter`);
            } else {
                selectedObj = document.getElementById(`letter${i}`);
            }
            selectedObj.style.visibility = 'visible';
        }
    }
}
