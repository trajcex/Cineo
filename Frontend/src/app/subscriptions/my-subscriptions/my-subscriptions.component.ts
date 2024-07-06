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
  actors: string[] = [];
  genres: string[] = [];
  directors: string[] = [];
  subscriptionsActors: string[] = [];
  subscriptionsGenres: string[] = [];
  subscriptionsDirectors: string[] = [];

  constructor(
    private lambdaService: LambdaService,
    private auth: AuthServiceService
  ) {}

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
        console.log('Get :', result);
      },
      error: (error: HttpErrorResponse) => {
        console.error('GetSubscriptions error:', error);
      },
    });
  }
}
