import { Injectable, Inject } from '@angular/core';
import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { delay } from 'q';
import { TransferLetterService } from '../../services/transfer-letter-service.service';
import { ProgressService } from '../../services/progress.service';
import data from '../../../assets/json/phonemes.json';
import badExamples from '../../../assets/json/bad-assets.json';
import schwas from '../../../assets/json/incorrect-schwas.json';
import { Phoneme } from '../../types/phoneme';
import { AlphabetLetter } from '../../types/alphabet-letter';
import { PhonemesService } from '../../services/phonemes.service';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
@Component({
  templateUrl: 'phoneme-quiz.component.html',
  styleUrls: ['phoneme-quiz.component.css']
})
export class PhonemeQuizComponent implements OnInit, OnDestroy, AfterViewInit {
  phonemeAnimate: boolean;
  phonemePlayAudio: boolean;
  phonemeAudio: HTMLAudioElement;

  ex1Animate: boolean;
  ex1CorrectAnimate: boolean;
  ex1PlayAudio: boolean;
  ex1Audio: HTMLAudioElement;

  ex2Animate: boolean;
  ex2CorrectAnimate: boolean;
  ex2PlayAudio: boolean;
  ex2Audio: HTMLAudioElement;

  ex3Animate: boolean;
  ex3CorrectAnimate: boolean;
  ex3PlayAudio: boolean;
  ex3Audio: HTMLAudioElement;

  rhymeAudio: HTMLAudioElement;
  correctAudio: HTMLAudioElement;
  incorrectAudio: HTMLAudioElement;

  data: Phoneme[];
  phoneme: Phoneme;
  quizPhoneme: Phoneme;
  list: string;
  grade: string;
  quizAll: string;
  capital: string;
  pre_category: string;
  incorrect_state: boolean = false;
  key: number;
  begin: boolean = false;

  correctAnswer: number;
  incorrectAnswerValue: number;

  longVowelList: string[];
  quizNumber: number = 0;
  schwasList: string[];

  img1: string;
  img2: string;
  img3: string;
  puzzleimg: string;
  rhyme: HTMLAudioElement;
  text: string;

  puzzlePieceImages: string[] = [];
  piecesToAnimate: number = 0;
  puzzleDirectory: string;
  puzzleAnimate: boolean = false;
  puzzleComplete: boolean = false;
  isFirstAttempt: boolean;
  hasGuessed: boolean;

  numberOfAttempts: number;
  correctOfAttempts: number;
  answerStartTime: number;
  correctAnswerValue: String;
  correctAnswerToDisplay: String;

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
    private phonemeProgressService: ProgressService,
    private router: Router,
    private activatedRoute: ActivatedRoute,

    private phonemesService: PhonemesService,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient
  ) {
    this.quizAll = this.activatedRoute.snapshot.queryParamMap.get('quizAll');
    this.grade = this.activatedRoute.snapshot.queryParamMap.get('grade');
    this.capital = this.activatedRoute.snapshot.queryParamMap.get('capital');
    this.pre_category = this.activatedRoute.snapshot.queryParamMap.get('pre_category');
    // Sets random phoneme if selected Quiz-all function
    if (this.quizAll === 'true') {
      let list = this.activatedRoute.snapshot.queryParamMap.get('list');
      this.list = list;

      // Chooses a random phoneme that belongs in its category
      var key = 0;

      if (this.grade) {
        this.data = this.phonemesService.dataLoad(list, this.grade, false);
      } else {
        this.data = this.phonemesService.dataLoad(list, '', false);
      }

      if (!list || list === '') {
        this.router.navigate(['']);
      } else {
        key = Math.floor(Math.random() * this.data.length);
      }

      this.phoneme = this.data[key];
      this.puzzleimg =
        '../../assets/img/puzzle-pieces/puzzle-' +
        this.phoneme.id +
        '/puzzle-' +
        this.phoneme.id +
        '-composite.png';
      this.text = this.phoneme.rhyme
        .replace(/[(]/g, '<span>')
        .replace(/[)]/g, '</span>')
        .replace(/;/g, ',');
    } else {
      this.phoneme = this.transferService.getData() as Phoneme;
      this.puzzleimg =
        '../../assets/img/puzzle-pieces/puzzle-' +
        this.phoneme.id +
        '/puzzle-' +
        this.phoneme.id +
        '-composite.png';
      this.text = this.phoneme.rhyme
        .replace(/[(]/g, '<span>')
        .replace(/[)]/g, '</span>')
        .replace(/;/g, ',');
    }

    this.puzzleDirectory =
      '../../assets/img/puzzle-pieces/puzzle-' + this.phoneme.id;
    this.phonemePlayAudio = true;
    this.phonemeAnimate = false;
    this.ex1Animate = false;
    this.ex2Animate = false;
    this.ex3Animate = false;

    for (let i = 0; i <= 3; i++) {
      for (let j = 0; j <= 2; j++) {
        this.puzzlePieceImages.push(
          this.puzzleDirectory +
            '/puzzle-' +
            this.phoneme.id +
            '-row' +
            i +
            '-col' +
            j +
            '.png'
        );
      }
    }

    // Random number generator that accepts a seed
    var LCG = (s) => () =>
      ((2 ** 31 - 1) & (s = Math.imul(48271, s))) / 2 ** 31;

    // Generate seed for rng based on phoneme id
    var hashCode = (s) =>
      s.split('').reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
    var hash = hashCode(this.phoneme.id);
    var rng = LCG(hash);

    // Shuffle order of puzzle pieces being displayed
    this.puzzlePieceImages.sort(function () {
      return rng() - 0.5;
    });

    // Analytics
    this.correctAnswerValue = '';
    this.numberOfAttempts = 0;
    this.correctOfAttempts = 0;
    this.answerStartTime = 0;

    this.ball = null;
    this.angle = 0;
    this.x = 0;
    this.y = 0;
    this.w = window.innerWidth / 2 - 2 * 3.8 * window.innerHeight / 100;
    this.h = window.innerHeight - 10 * window.innerHeight / 100-100;
    this.bankAnimation = false;

    this.goldStarImg = '../../assets/img/progress/Gold-Star-Blank.png';
    this.silverStarImg = '../../assets/img/progress/Silver-Star-Blank.png';
    
    if (this.pre_category && this.pre_category != null) {
      this.starIndex = this.phonemeProgressService.getGoldStarsFromKey('phoneme_' + this.pre_category + '_' + this.phoneme.id);
    } else {
      this.starIndex = this.phonemeProgressService.getGoldStarsFromKey('phoneme' + this.phoneme.id);
    }
    if (this.starIndex == 0) {
      this.starStatus = [];
    } else {
      for(let i = 0; i < this.starIndex; i++) {
        this.starStatus.push('gold');
      }
    }
  }

  goBack() {
    this.transferService.setData(this.phoneme);
    window.history.go(-1);
  }

  setPane() {
    for (let i = 0; i < 3; i++) {
      var selectedObj = document.getElementById(`pane-${i}`);
      selectedObj.style.visibility = 'visible';
    }
  }

  ngOnInit() {
    this.quizNumber++;

    var temp_number = 0;
    if (this.pre_category && this.pre_category != null) {
      this.phoneme.puzzlePiecesEarned = this.phonemeProgressService.getPuzzlePieces(
        this.pre_category + '_' + this.phoneme.id
        );
      temp_number = this.phonemeProgressService.getQuizNumber('quizNumber' + '_' + this.pre_category + '_' + this.phoneme.id);
    } else {
      temp_number = this.phonemeProgressService.getQuizNumber('quizNumber' + '_' + this.phoneme.id);
      this.phoneme.puzzlePiecesEarned = this.phonemeProgressService.getPuzzlePieces(
        this.phoneme.id
      );
    }

    if (temp_number != null) {
      this.quizNumber = temp_number;
    }

    if (this.phoneme.puzzlePiecesEarned == 12) {
      this.puzzleComplete = true;
    }

    //Generate list of long vowel words for screening vowel sound phonemes

    this.longVowelList = [];

    //Only generate the list if the phoneme selected is a vowel sound

    if (
      this.phoneme.category.includes('V-long') ||
      this.phoneme.category.includes('V-short')
    ) {
      data.forEach((element) => {
        if (
          element['category'].includes('V-long') &&
          !element['id'].includes(this.phoneme.id.charAt(0))
        ) {
          this.longVowelList = [].concat(
            this.longVowelList,
            element['quiz-words']
          );
        }
      });
    }

    //Generate a list for schwas

    if (this.phoneme.category.includes('V-schwa')) {
      this.schwasList = schwas;
    }

    this.correctAudio = new Audio();
    this.correctAudio.src = '/assets/audio/buttons/correct.mp3';
    this.correctAudio.load();
    
    this.incorrectAudio = new Audio();
    this.incorrectAudio.src = '/assets/audio/incorrect_answer_sound.mp3';
    this.incorrectAudio.load();

    this.phonemeAudio = new Audio();
    this.phonemeAudio.src = this.phoneme.audio;
    this.phonemeAudio.load();

    this.ex1Audio = new Audio();
    this.ex2Audio = new Audio();
    this.ex3Audio = new Audio();

    this.correctAnswer = Math.floor(Math.random() * 3);

    var examples = this.generateExamples();
    var temp = examples[this.correctAnswer];
    examples[this.correctAnswer] = examples[0];
    this.correctAnswerValue = examples[this.correctAnswer];
    examples[0] = temp;

    this.correctAnswerToDisplay = this.generateDisplayAnswer();

    this.img1 =
      '/assets/img/sight-words/' + examples[0].replace(/\s/g, '') + '.png';
    this.img2 =
      '/assets/img/sight-words/' + examples[1].replace(/\s/g, '') + '.png';
    this.img3 =
      '/assets/img/sight-words/' + examples[2].replace(/\s/g, '') + '.png';

    this.ex1Audio.src =
      '/assets/audio/sight-words/' + examples[0].replace(/\s/g, '') + '.mp3';
    this.ex2Audio.src =
      '/assets/audio/sight-words/' + examples[1].replace(/\s/g, '') + '.mp3';
    this.ex3Audio.src =
      '/assets/audio/sight-words/' + examples[2].replace(/\s/g, '') + '.mp3';

    this.ex1Audio.load();
    this.ex2Audio.load();
    this.ex3Audio.load();

    // this.setPane();

    this.playAudio();

    this.phonemeAudio.onended = () => {
      this.phonemeAnimate = false;
      if (this.incorrectAnswerValue != 0 ) {
        this.ex1Animate = true;
        delay(250).then(() => {
          this.ex1Audio.play();
        });
      } else {
        this.ex2Animate = true;
        delay(250).then(() => {
          this.ex2Audio.play();
        });
      }
    };
    this.ex1Audio.onended = () => {
      this.ex1Animate = false;
      if (this.incorrectAnswerValue != 1 ) {
        this.ex2Animate = true;
        delay(250).then(() => {
          this.ex2Audio.play();
        });
      } else {
        this.ex3Animate = true;
        delay(250).then(() => {
          this.ex3Audio.play();
        });
      }
    };
    this.ex2Audio.onended = () => {
      this.ex2Animate = false;
      if (this.incorrectAnswerValue != 2 ) {
        this.ex3Animate = true;
        delay(250).then(() => {
          this.ex3Audio.play();
        });
      }
    };
    this.ex3Audio.onended = () => {
      this.ex3Animate = false;
    };

    this.isFirstAttempt = true;
    this.hasGuessed = false;

    // Analytics
    this.answerStartTime = Date.now();
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

  generateDisplayAnswer() {
    var word = this.correctAnswerValue;
    var pos = word.indexOf(this.phoneme.display);
    var length = this.phoneme.display.length;
    if (pos === 0) {
      var temp = word.substr(pos + length);
      return `<span>${this.phoneme.display}</span>${temp}`;
    } else {
      var temp = word.substr(0, pos);
      var total_length = word.length;
      var second = word.substr(pos+length, total_length)
      return `${temp}<span>${this.phoneme.display}</span>${second}`;
    }
  }

  ngAfterViewInit() {
    if (this.capital) {
      var temp = <HTMLElement>document.getElementById('main-body');
      temp.style.textTransform = 'uppercase';
    }
    this.ball = <HTMLElement> document.getElementById('ball');
  }

  ngOnDestroy() {
    this.phonemeAudio.pause();
    this.phonemeAudio = null;
    this.phonemeAnimate = false;

    this.ex1Audio.pause();
    this.ex1Audio = null;
    this.ex1Animate = false;

    this.ex2Audio.pause();
    this.ex2Audio = null;
    this.ex2Animate = false;

    this.ex3Audio.pause();
    this.ex3Audio = null;
    this.ex3Animate = false;

    if (this.rhymeAudio) {
      this.rhymeAudio.pause();
      this.rhymeAudio = null;
    }
  }

  stopAudioAndAnimation() {
    this.phonemeAudio.pause();
    this.phonemeAudio.currentTime = 0;
    this.phonemeAnimate = false;

    this.ex1Audio.pause();
    this.ex1Audio.currentTime = 0;
    this.ex1Animate = false;

    this.ex2Audio.pause();
    this.ex2Audio.currentTime = 0;
    this.ex2Animate = false;

    this.ex3Audio.pause();
    this.ex3Audio.currentTime = 0;
    this.ex3Animate = false;
  }

  playAudio() {
    this.stopAudioAndAnimation();
    this.phonemeAnimate = true;
    this.phonemeAudio.play();
  }

  playPhonemeAudio() {
    this.phonemeAnimate = true;
    this.phonemeAudio.onended = () => {
      this.phonemeAnimate = false;
      this.phonemeAudio.onended = () => {
        this.phonemeAnimate = false;
        this.ex1Animate = true;
        delay(250).then(() => {
          this.ex1Audio.play();
        });
      };
    };
    this.phonemeAudio.play();
  }

  resetStarStatus() {
    let goldStarNum;
    if (this.pre_category && this.pre_category != null) {
      goldStarNum = this.phonemeProgressService.getGoldStarsFromKey('phoneme' + '_' + this.pre_category + '_' + this.phoneme.id)
    } else {
      goldStarNum = this.phonemeProgressService.getGoldStarsFromKey('phoneme' + this.phoneme.id)
    }
    if (goldStarNum > 0 && goldStarNum < 5) {
      for (let i = 0; i < goldStarNum; i++) {
        this.starStatus[i] = 'silver';
        if (this.pre_category && this.pre_category != null) {
          this.phonemeProgressService.saveStarsToKey(
            'phoneme' + '_' + this.pre_category + '_' + this.phoneme.id + 'gold',
            -1
          );
        } else {
          this.phonemeProgressService.saveStarsToKey(
            'phoneme' + this.phoneme.id + 'gold',
            -1
          );
        }
      }
    }
  }

  onCorrect() {
    this.numberOfAttempts++;
    this.quizNumber++;
    if (this.pre_category && this.pre_category != null) {
      this.phonemeProgressService.saveQuizNumber('quizNumber' + '_' + this.pre_category + '_' + this.phoneme.id, this.quizNumber);
    } else {
      this.phonemeProgressService.saveQuizNumber('quizNumber' + '_' + this.phoneme.id, this.quizNumber);
    }

    var initialPuzzlePieces = this.phoneme.puzzlePiecesEarned;
    this.correctOfAttempts = this.numberOfAttempts;
    if (this.numberOfAttempts == 1) {
      this.numberOfAttempts = 0;
      this.ball.style.backgroundImage = `url('../../../assets/img/rewards/gold_coin.jpg')`;
      this.ballCircle();
      delay(500).then(() => {
        this.bankAnimation = false;
      })
      if (this.starIndex < 5) {
        this.starStatus[`${this.starIndex}`] = 'gold';
        if (this.pre_category && this.pre_category != null) {
          this.phonemeProgressService.saveStarsToKey(
            'phoneme' + '_' + this.pre_category + '_' + this.phoneme.id + 'gold',
            1
          );
        } else {
          this.phonemeProgressService.saveStarsToKey(
            'phoneme' + this.phoneme.id + 'gold',
            1
          );
        }
        this.starIndex++;
      }
      this.phonemeProgressService.addCoins('phoneme' + this.phoneme.id, 2);
      if (this.pre_category && this.pre_category != null) {
        this.phonemeProgressService.addPuzzlePieces(this.pre_category + '_' + this.phoneme.id, 2);
      } else {
        this.phonemeProgressService.addPuzzlePieces(this.phoneme.id, 2);
      }
    } else if (this.numberOfAttempts == 2) {
      this.starIndex = 0;
      this.resetStarStatus();
      this.ball.style.backgroundImage = `url('../../../assets/img/rewards/silver_coin.png')`;
      this.ballCircle();
      delay(500).then(() => {
          this.bankAnimation = false;
      })
      this.numberOfAttempts = 0;
      if (this.pre_category && this.pre_category != null) {
        this.phonemeProgressService.addPuzzlePieces(this.pre_category + '_' + this.phoneme.id, 1);
      } else {
        this.phonemeProgressService.addPuzzlePieces(this.phoneme.id, 1);
      }
      this.phonemeProgressService.addCoins('phoneme' + this.phoneme.id, 1);
      this.hasGuessed = false;
    } else {
      this.starIndex = 0;
      this.resetStarStatus();
      this.numberOfAttempts = 0;
      this.hasGuessed = false;
    }

    if (this.pre_category && this.pre_category != null) {
      this.phoneme.puzzlePiecesEarned = this.phonemeProgressService.getPuzzlePieces(
        this.pre_category + '_' + this.phoneme.id
      );
    } else {
      this.phoneme.puzzlePiecesEarned = this.phonemeProgressService.getPuzzlePieces(
        this.phoneme.id
      );
    }
    this.piecesToAnimate =
      this.phoneme.puzzlePiecesEarned - initialPuzzlePieces;

    if (this.correctAnswer == 0) {
      this.ex1CorrectAnimate = true;
    } else if (this.correctAnswer == 1) {
      this.ex2CorrectAnimate = true;
    } else if (this.correctAnswer == 2) {
      this.ex3CorrectAnimate = true;
    }
    delay(200).then(() => {
      this.correctAudio.play();
    });
    this.correctAudio.onended = () => {
      this.ex1CorrectAnimate = false;
      this.ex2CorrectAnimate = false;
      this.ex3CorrectAnimate = false;
      for (let i = 0; i < 3; i++) {
        var selectedObj = document.getElementById(`pane-${i}`);
        selectedObj.style.visibility = 'hidden';
      }
      if (this.phoneme.puzzlePiecesEarned == 12) {
        // Add checkmark
        if (this.pre_category && this.pre_category != null) {
          this.phonemeProgressService.setCheckMark(
            'phoneme' + '_' + this.pre_category + '_' + this.phoneme.id,
            true
          );
        } else {
          this.phonemeProgressService.setCheckMark(
            'phoneme' + this.phoneme.id,
            true
          );
        }
  
        // Update puzzle view
        this.puzzleAnimate = true;
        delay(900).then(() => {
          this.puzzleAnimate = false;
          this.changeDetectorRef.detectChanges();
        });
        if (this.puzzleComplete == false) {
          //Navigate to rhyme page
          this.transferService.setData(this.phoneme);
          this.router.navigate(['puzzle'], { queryParams: { from: 'quiz' } });
        } else {
          this.puzzleComplete = true;
          delay(900).then(() => {
            this.loadNew();
            // this.setPane();
          });
        }
      } else {
        // Update puzzle view
        this.puzzleAnimate = true;
        delay(900).then(() => {
          this.puzzleAnimate = false;
          this.changeDetectorRef.detectChanges();
        });
        this.isFirstAttempt = true;
  
        // Analytics
        this.answerStartTime = Date.now();
  
        // Update examples
        if (this.quizAll) {
          delay(900).then(() => {
            window.location.reload();
          });
        } else {
          delay(900).then(() => {
            this.loadNew();
            // this.setPane();
          });
        }
      }
    };

    if (this.pre_category && this.pre_category != null) {
      this.submitAnalyticEvent(`${this.pre_category}_${this.phoneme.id}`).subscribe((r) => console.log(r));
    } else {
      this.submitAnalyticEvent(this.phoneme.id).subscribe((r) => console.log(r));
    }
  }
  goToPuzzle() {
    if (this.phoneme.puzzlePiecesEarned == 12) {
      this.transferService.setData(this.phoneme);
      this.router.navigate(['puzzle'], { queryParams: { from: 'quiz' } });
    }
  }

  loadNew() {
    this.correctAnswer = Math.floor(Math.random() * 3);
    this.incorrectAnswerValue = null;

    var examples = this.generateExamples();
    var temp = examples[this.correctAnswer];
    examples[this.correctAnswer] = examples[0];
    this.correctAnswerValue = examples[this.correctAnswer];
    examples[0] = temp;

    this.correctAnswerToDisplay = this.generateDisplayAnswer();

    this.img1 = '/assets/img/sight-words/' + examples[0] + '.png';
    this.img2 = '/assets/img/sight-words/' + examples[1] + '.png';
    this.img3 = '/assets/img/sight-words/' + examples[2] + '.png';

    this.ex1Audio.src = '/assets/audio/sight-words/' + examples[0] + '.mp3';
    this.ex2Audio.src = '/assets/audio/sight-words/' + examples[1] + '.mp3';
    this.ex3Audio.src = '/assets/audio/sight-words/' + examples[2] + '.mp3';

    this.ex1Audio.load();
    this.ex2Audio.load();
    this.ex3Audio.load();

    this.incorrect_state = false;
    this.playAudio();
    delay(1500).then(() => {
      this.setPane();
    })
  }

  generateExamples() {
    var positiveExample;

    var positiveExamples = this.phoneme.quizWords;

    if (this.quizNumber % positiveExamples.length == 1) {
      positiveExample = this.phoneme.word1.word;
    } else if (this.quizNumber % positiveExamples.length == 2) {
      positiveExample = this.phoneme.word2.word;
    } else if (this.quizNumber % positiveExamples.length == 3) {
      positiveExample = this.phoneme.word3.word;
    } else {
      positiveExample = this.phoneme.quizWords[
        Math.floor(Math.random() * this.phoneme.quizWords.length)
      ];
    }

    var examples = ['test', 'one', 'two'];

    var first = this.generateNegativeExample(positiveExamples);
    var second = this.generateSecondNegativeExample(positiveExamples, first);

    examples = [positiveExample, first, second];

    return examples;
  }

  isValidNegativeExample(example, positiveExamples) {
    if (example.includes(this.phoneme.id.charAt(0).toLowerCase())) {
      return false;
    }
    if (
      (this.phoneme.id == 'E-long' || this.phoneme.id == 'I-long') &&
      example.includes('y')
    ) {
      return false;
    }
    //Lockout for long/short vowels and schwas to make sure they don't have to go through the checks
    if (
      this.phoneme.category.includes('V-short') ||
      this.phoneme.category.includes('V-long') ||
      this.phoneme.category.includes('V-schwa')
    ) {
      return true; //returns true because the logic in the making of the list has been checked
    }

    if (
      (this.phoneme.id == 'G-GH' ||
        this.phoneme.id.includes('F-fuh') ||
        this.phoneme.id.includes('P-PH')) &&
      (example.includes('f') ||
        example.includes('ph') ||
        example.includes('gh'))
    ) {
      return false;
    }
    if (
      (this.phoneme.id.includes('Z-zzz') ||
        this.phoneme.id == 'S-zz' ||
        this.phoneme.id == 'S-SC-silent') &&
      (example.includes('s') || example.includes('z'))
    ) {
      return false;
    }
    if (
      (this.phoneme.id == 'A-AI' || this.phoneme.id == 'E-EI') &&
      (example.includes('ei') || example.includes('a'))
    ) {
      return false;
    }
    if (
      (this.phoneme.id == 'A-AU' || this.phoneme.id == 'A-AW') &&
      (example.includes('o') || example.includes('a'))
    ) {
      return false;
    }
    if (this.phoneme.id == 'A-AY' && example.includes('a')) {
      return false;
    }
    if (this.phoneme.id == 'C-sss' && example.includes('s')) {
      return false;
    }
    if (
      (this.phoneme.id.includes('C-CK') || this.phoneme.id.includes('K-kuh')) &&
      (example.includes('c') || example.includes('k'))
    ) {
      return false;
    }
    if (this.phoneme.category.includes('E') && example.includes('e')) {
      return false;
    }
    if (
      this.phoneme.id.includes('E-E') &&
      (example.includes('e') || example.includes('a'))
    ) {
      return false;
    }
    if (this.phoneme.category.includes('R') && example.includes('r')) {
      return false;
    }
    if (this.phoneme.id.includes('E-ET') && example.includes('et')) {
      return false;
    }
    if (
      this.phoneme.id == 'E-EW' &&
      (example.includes('o') || example.includes('u'))
    ) {
      return false;
    }
    if (
      (this.phoneme.id.includes('N-silent') ||
        this.phoneme.id.includes('N-nnn')) &&
      example.includes('n')
    ) {
      return false;
    }
    if (
      this.phoneme.id.charAt(0) == 'I' &&
      (example.includes('i') || example.includes('e'))
    ) {
      return false;
    }
    if (this.phoneme.id == 'L-LE' && example.includes('l')) {
      return false;
    }
    if (
      (this.phoneme.id == 'M-MB-silent' || this.phoneme.id.includes('M-mmm')) &&
      example.includes('m')
    ) {
      return false;
    }
    if (
      this.phoneme.id.includes('O') &&
      (example.includes('o') || example.includes('u'))
    ) {
      return false;
    }
    if (
      this.phoneme.id == 'T-TCH-silent' &&
      (example.includes('ch') || example.includes('sh'))
    ) {
      return false;
    }
    if (this.phoneme.id.includes('TH') && example.includes('th')) {
      return false;
    }
    if (this.phoneme.id.includes('W-W') && example.includes('w')) {
      return false;
    }
    if (this.phoneme.id == 'W-WR-silent' && example.includes('r')) {
      return false;
    }
    if (
      this.phoneme.category.includes('Y') &&
      (example.includes('e') || example.includes('i'))
    ) {
      return false;
    }
    if (this.phoneme.category.includes('CG') && example.includes('j')) {
      return false;
    }

    return (
      !positiveExamples.includes(example) &&
      !example.includes(this.phoneme.display) &&
      !badExamples.includes(example)
    );
  }

  isValidSecondNegativeExample(example, positiveExamples, firstNegative) {
    if (example == firstNegative) {
      return false;
    }
    if (example.includes(this.phoneme.id.charAt(0).toLowerCase())) {
      return false;
    }
    if (
      (this.phoneme.id == 'E-long' || this.phoneme.id == 'I-long') &&
      example.includes('y')
    ) {
      return false;
    }
    //Lockout for long/short vowels to make sure they don't have to go through the checks
    if (
      this.phoneme.category.includes('V-short') ||
      this.phoneme.category.includes('V-long') ||
      this.phoneme.category.includes('V-schwa')
    ) {
      return true; //returns true because the logic in the making of the list has been checked
    }

    if (
      (this.phoneme.id == 'G-GH' ||
        this.phoneme.id.includes('F-fuh') ||
        this.phoneme.id.includes('P-PH')) &&
      (example.includes('f') ||
        example.includes('ph') ||
        example.includes('gh'))
    ) {
      return false;
    }
    if (
      (this.phoneme.id.includes('Z-zzz') ||
        this.phoneme.id == 'S-zz' ||
        this.phoneme.id == 'S-SC-silent') &&
      (example.includes('s') || example.includes('z'))
    ) {
      return false;
    }
    if (
      (this.phoneme.id == 'A-AI' || this.phoneme.id == 'E-EI') &&
      (example.includes('ei') || example.includes('a'))
    ) {
      return false;
    }
    if (
      (this.phoneme.id == 'A-AU' || this.phoneme.id == 'A-AW') &&
      (example.includes('o') || example.includes('a'))
    ) {
      return false;
    }
    if (this.phoneme.id == 'A-AY' && example.includes('a')) {
      return false;
    }
    if (this.phoneme.id == 'C-sss' && example.includes('s')) {
      return false;
    }
    if (
      (this.phoneme.id.includes('C-CK') || this.phoneme.id.includes('K-kuh')) &&
      (example.includes('c') || example.includes('k'))
    ) {
      return false;
    }
    if (this.phoneme.category.includes('E') && example.includes('e')) {
      return false;
    }
    if (
      this.phoneme.id.includes('E-E') &&
      (example.includes('e') || example.includes('a'))
    ) {
      return false;
    }
    if (this.phoneme.category.includes('R') && example.includes('r')) {
      return false;
    }
    if (this.phoneme.id.includes('E-ET') && example.includes('et')) {
      return false;
    }
    if (
      this.phoneme.id == 'E-EW' &&
      (example.includes('o') || example.includes('u'))
    ) {
      return false;
    }
    if (
      (this.phoneme.id.includes('N-silent') ||
        this.phoneme.id.includes('N-nnn')) &&
      example.includes('n')
    ) {
      return false;
    }
    if (
      this.phoneme.id.charAt(0) == 'I' &&
      (example.includes('i') || example.includes('e'))
    ) {
      return false;
    }
    if (this.phoneme.id == 'L-LE' && example.includes('l')) {
      return false;
    }
    if (
      (this.phoneme.id == 'M-MB-silent' || this.phoneme.id.includes('M-mmm')) &&
      example.includes('m')
    ) {
      return false;
    }
    if (
      this.phoneme.id.includes('O') &&
      (example.includes('o') || example.includes('u'))
    ) {
      return false;
    }
    if (
      this.phoneme.id == 'T-TCH-silent' &&
      (example.includes('ch') || example.includes('sh'))
    ) {
      return false;
    }
    if (this.phoneme.id.includes('TH') && example.includes('th')) {
      return false;
    }
    if (this.phoneme.id.includes('W-W') && example.includes('w')) {
      return false;
    }
    if (this.phoneme.id == 'W-WR-silent' && example.includes('r')) {
      return false;
    }
    if (
      this.phoneme.category.includes('Y') &&
      (example.includes('e') || example.includes('i'))
    ) {
      return false;
    }
    if (this.phoneme.category.includes('CG') && example.includes('j')) {
      return false;
    }

    return (
      !positiveExamples.includes(example) &&
      !example.includes(this.phoneme.display) &&
      !badExamples.includes(example)
    );
  }

  generateNegativeExample(positiveExamples) {
    var example;
    do {
      example = this.randomQuizWord();
    } while (!this.isValidNegativeExample(example, positiveExamples));
    return example;
  }

  generateSecondNegativeExample(positiveExamples, firstNegative) {
    var example;
    do {
      example = this.randomQuizWord();
    } while (
      !this.isValidSecondNegativeExample(
        example,
        positiveExamples,
        firstNegative
      )
    );
    return example;
  }

  randomQuizWord() {
    var quizWords = data[Math.floor(Math.random() * data.length)]['quiz-words'];

    //Use only the long vowel list if the quiz phoneme is a vowel sound

    if (
      this.phoneme.category.includes('V-long') ||
      this.phoneme.category.includes('V-short')
    ) {
      quizWords = this.longVowelList;
    }

    //Use the schwa list if the quiz phoneme is a schwa

    if (this.phoneme.category.includes('V-schwa')) {
      quizWords = this.schwasList;
    }

    return quizWords[Math.floor(Math.random() * quizWords.length)];
  }

  onClick1(index) {
    if (this.correctAnswer == index) {
      this.incorrect_state = false;
      this.onCorrect();
      // this.setPane();
    } else {
      this.incorrectAnswerValue = index;
      this.incorrectAnswer();
      if (this.incorrect_state == false) {
        this.playAudio();
      }
    }
  }

  onClick2(index) {
    if (this.correctAnswer == index) {
      this.incorrect_state = false;
      this.onCorrect();
      // this.setPane();
    } else {
      this.incorrectAnswerValue = index;
      this.incorrectAnswer();
      if (this.incorrect_state == false) {
        this.playAudio();
      }
    }
  }

  onClick3(index) {
    if (this.correctAnswer == index) {
      this.incorrect_state = false;
      this.onCorrect();
      // this.setPane();
    } else {
      this.incorrectAnswerValue = index;
      this.incorrectAnswer();
      if (this.incorrect_state == false) {
        this.playAudio();
      }
    }
  }

  incorrectAnswer() {
    this.starIndex = 0;
    this.resetStarStatus();
    this.incorrectAudio.play();
    var selectedObj = document.getElementById(`pane-${this.incorrectAnswerValue}`);
    selectedObj.style.visibility = 'hidden';
    this.numberOfAttempts++;

    if (!this.hasGuessed) {
      this.hasGuessed = true;
      this.isFirstAttempt = false;      
    }

    if (this.pre_category && this.pre_category != null) {
      this.phonemeProgressService.addIncorrectAnswer('phoneme' + '_' + this.pre_category + '_' + this.phoneme.id);
    } else {
      this.phonemeProgressService.addIncorrectAnswer('phoneme' + this.phoneme.id);
    }

    if (this.numberOfAttempts % 2 == 0) {
      const currentIndex = this.transferService
        .getList()
        .findIndex((value: Phoneme | AlphabetLetter) => {
          return (value as Phoneme).id === this.phoneme.id;
        });
      if (currentIndex === this.transferService.getList().length - 1) {
        this.phoneme = this.transferService.getList()[0] as Phoneme;
      } else {
        this.phoneme = this.transferService.getList()[
          currentIndex
        ] as Phoneme;
      }
      this.incorrect_state = true;
      this.incorrectAudio.onended = () => {
        this.ngOnInit();
        this.loadNew();
      }
    }
  }

  submitAnalyticEvent(phonemeId) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.storage.get('token')}`
    });

    return this.http.post(
      'https://teacherportal.hearatale.com/api/analytics/application',
      {
        student: this.storage.get('user_id'),
        program: '5f087dc650084d0851a04b5b',
        focus_item_name: `phoneme_${phonemeId}`,
        focus_item_unit: this.storage.get('unit'),
        focus_item_subunit: 'phoneme',
        time_spent: Date.now() - this.answerStartTime,
        correct_on: this.correctOfAttempts
      },
      {
        headers
      }
    );
  }
}
