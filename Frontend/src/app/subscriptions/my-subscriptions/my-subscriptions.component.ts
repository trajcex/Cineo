import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthServiceService } from 'src/app/service/auth-service.service';
import { LambdaService } from 'src/app/service/lambda.service';

@Component({
  selector: 'app-my-subscriptions',
  templateUrl: './my-subscriptions.component.html',
  styleUrls: ['./my-subscriptions.component.css'],
})
export class MySubscriptionsComponent {
  subscribeValue = '';
  type = '';
  actors: string[] = [];
  genres: string[] = [];
  directors: string[] = [];
  subscriptionsActors: string[] = [];
  subscriptionsGenres: string[] = [];
  subscriptionsDirectors: string[] = [];
  subscriptions: string[] = [];

  constructor(
    private lambdaService: LambdaService,
    private auth: AuthServiceService
  ) {}

  setValue(value: string, type: string) {
    this.subscribeValue = value;
    this.type = type;
  }

  subscribe() {
    var body = {
      userID: this.auth.getUserID(),
      email: this.auth.getEmail(),
      type: this.type,
      topic: this.subscribeValue,
    };

    this.lambdaService.subscribe(body).subscribe({
      next: (result) => {
        console.log('Subscribe: ', result);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error:', error);
      },
    });
    this.subscribeValue = '';
  }
  unsubscribe() {
    var body = {
      userID: this.auth.getUserID(),
      email: this.auth.getEmail(),
      type: this.type,
      topic: this.subscribeValue,
    };

    this.lambdaService.unsubscribe(body).subscribe({
      next: (result) => {
        console.log('Unsubscribe: ', result);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error:', error);
      },
    });

    this.subscribeValue = '';
  }

  ngOnInit() {
    this.lambdaService.getPossibleSubscriptions().subscribe({
      next: (result) => {
        this.actors = result.actors;
        this.genres = result.genres;
        this.directors = result.directors;
        console.log('GetPossibleSubscriptions result:', result);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error:', error);
      },
    });
    this.lambdaService.getSubscriptions().subscribe({
      next: (result) => {
        this.subscriptionsActors = result.actors;
        this.subscriptionsGenres = result.genres;
        this.subscriptionsDirectors = result.directors;
        this.subscriptions = this.subscriptions
          .concat(result.actors)
          .concat(result.genres)
          .concat(result.directors);
        console.log('Get :', this.subscriptions);
      },
      error: (error: HttpErrorResponse) => {
        console.error('GetSubscriptions error:', error);
      },
    });
  }
}
