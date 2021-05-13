import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionInput, ISessionResult, ISession } from './app';
import { AppService } from './app.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('audioOption', { static: true }) audioPlayerRef: ElementRef;

  public title = 'cowin session tracker';
  public sessionInput: SessionInput;
  public sessionResult: ISessionResult;
  public isStart: boolean;
  public isShowSlot: boolean;
  public isMatched: boolean;
  public isAlarmPaused: boolean;
  public time: number = 0;
  public interval;
  public audio;
  public session$: Subscription;
  public trigger$: Subscription;
  public alarm$: Subscription;

  constructor(
    private appService: AppService,
    private _snackBar: MatSnackBar
  ) {
    this.initializeSessionInput();
  }

  ngOnInit() {
    this.getCatchedTimer();
    this.checkTimerContinue();
    this.initializeAudio();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  initializeSessionInput() {
    this.sessionInput = new SessionInput(382421, this.getTodayDate(), 18);
  }

  initializeAudio() {
    this.audio = this.audioPlayerRef.nativeElement;
    this.audio.muted = true;
  }

  checkTimerContinue() {
    if (this.isStart) {
      this.initializeAudio();
      this.getSession();
      this.subscribe();
      this.trigger();
      this.alarm();
      this.interval = setInterval(() => {
        this.time++;
        this.catchTimer();
      }, 1000);
    }
  }

  subscribe() {
    const sessionSource = interval(parseInt(this.sessionInput.interval.toString()) * 1000);
    this.session$ = sessionSource.subscribe(val => this.pullSession());

    const triggerSource = interval(10000);
    this.trigger$ = triggerSource.subscribe(val => this.trigger());

    const alarmSource = interval(10000);
    this.alarm$ = alarmSource.subscribe(val => this.alarm());
  }

  unsubscribe() {
    this.session$.unsubscribe();
    this.trigger$.unsubscribe();
    this.alarm$.unsubscribe();
  }

  start() {
    this.isStart = !this.isStart;
    this.interval = setInterval(() => {
      this.time++;
      this.catchTimer();
    }, 1000);

    this.getSession();
    this.subscribe();
  }

  stop() {
    this.isStart = !this.isStart;
    this.time = 0;
    clearInterval(this.interval);
    this.resetTimerCatch();
    this.unsubscribe();
  }

  setAlarmAction() {
    this.isAlarmPaused = !this.isAlarmPaused;
    if (this.isAlarmPaused) {
      this.pauseAudio();
    }
  }

  playAudio() {
    if (!this.isAlarmPaused) {
      this.audio.muted = false;
      this.audio.play();
    }
  }

  pauseAudio() {
    this.audio.muted = true;
    this.audio.pause();
  }

  trigger() {
    console.log('trigger runs...');
    if (this.sessionResult?.sessions.length > 0) {
      let matched = this.sessionResult.sessions.filter(
        x => x.pincode == this.sessionInput.pincode
          && (x.min_age_limit == this.sessionInput.age || !this.sessionInput.age)
          && (x.vaccine == this.sessionInput.vacccine || !this.sessionInput.vacccine)
          && (x.fee_type == this.sessionInput.fee_type || !this.sessionInput.fee_type)
      );

      if (matched && matched.length > 0) {
        this.isMatched = true;
        this.markupRow(matched);
      }
      else {
        this.isMatched = false;
        this.clearMarkup();
      }

      this.alarm();
    }
  }

  markupRow(rows: ISession[]) {
    this.sessionResult?.sessions.forEach(row => {
      if (rows.indexOf(row) > -1) {
        row.is_matched = true;
      }
      else {
        row.is_matched = false;
      }
    });
  }

  clearMarkup() {
    this.sessionResult?.sessions.forEach(row => {
      row.is_matched = false;
    });
  }

  alarm() {
    if (this.isMatched) {
      console.log('alarm start...');
      this.playAudio();
    }
    else {
      console.log('alarm stop...');
      this.pauseAudio();
    }
  }

  pullSession() {
    this.getSession();
  }

  getSession() {
    console.log('get session runs...');
    this.appService.getSessionByPin(this.getQueryString()).subscribe(
      data => {
        this.sessionResult = <ISessionResult>data;
        if (this.sessionResult && this.sessionResult.sessions.length > 0) {
          this.isShowSlot = true;
        }
        else {
          this.isShowSlot = false;
        }
      }
    );
  }

  getQueryString() {
    return `pincode=${this.sessionInput.pincode}&date=${this.sessionInput.date}`
  }

  getTodayDate(): string {
    let dt = new Date();
    return `${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()}`;
  }

  catchTimer() {
    localStorage.setItem("time", this.time.toString());
    localStorage.setItem("isStart", this.isStart ? "true" : "false");
    localStorage.setItem("sessionInput", JSON.stringify(this.sessionInput));
    localStorage.setItem("sessionResult", JSON.stringify(this.sessionResult));
  }

  getCatchedTimer() {
    let time = localStorage.getItem("time");
    this.time = time ? parseInt(time) : 0;

    let isStart = localStorage.getItem("isStart");
    this.isStart = isStart == 'true' ? true : false;

    let sessionInput = localStorage.getItem("sessionInput");
    if (sessionInput) {
      this.sessionInput = JSON.parse(sessionInput);
    }

    let sessionResult = localStorage.getItem("sessionResult");
    if (sessionResult) {
      this.sessionResult = JSON.parse(sessionResult);
    }
  }

  resetTimerCatch() {
    localStorage.setItem("time", "0");
    localStorage.setItem("isStart", "false");
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'X');
  }
}
