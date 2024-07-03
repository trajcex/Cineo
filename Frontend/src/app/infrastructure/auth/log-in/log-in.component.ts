import { Component } from '@angular/core';
import { AuthServiceService } from 'src/app/service/auth-service.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
})
export class LogInComponent {
  formFields = {
    signUp: {
      email: {
        order: 1,
      },
      password: {
        order: 2,
      },
      confirm_password: {
        order: 3,
      },
      nickname: {
        order: 4,
      },
      birthdate: {
        order: 5,
      },
      given_name: {
        order: 6,
      },
      family_name: {
        order: 7,
      },
    },
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const token =
      'eyJraWQiOiJkMFJyTVFSS0V2TnUzQmFmZEZnMXIyY2Zsck94dVhhRkVwUVlZM0p0eE9VPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIxMzU0YThjMi1iMGMxLTcwMmUtZTE4My1kYjY2NTA2YjY4MjIiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbiJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb21cL2V1LWNlbnRyYWwtMV8wMEt5Vm9LR3giLCJjbGllbnRfaWQiOiJ2ZzVtdTdobDJxbmNiOWJscmY3YXVucDhyIiwib3JpZ2luX2p0aSI6ImQ0OTEyOGM4LTJiZGItNGY2MS1iODFmLTE1YmZkYTFmZDFjNCIsImV2ZW50X2lkIjoiZjE0NGZiOGUtNDc2ZC00MDhjLTkxZDEtNjA3ZDgwZDAxMWU5IiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTcyMDAwNDcxMiwiZXhwIjoxNzIwMDE0MTY3LCJpYXQiOjE3MjAwMTA1NjcsImp0aSI6IjFhNmJlMjY1LWViMWUtNDg3Mi1iZjE5LTM2NzMxMzNmZTFjZCIsInVzZXJuYW1lIjoibmlrb2xhdHJhamtvdmljdkBnbWFpbC5jb20ifQ.dUoIxLa8PPwSVC-0fEVOUSU1NYiDHwcD0WX184pjHvgxG-Opa3SeWMgS3nRI-HfY_jzRMzIqmJLkadok3Y-Gxe387QBwttusgBe81usT-T8s0mC_woG95gdWUTZh70uFQAmbfhdfLLZD_XvkN63Gr_vNyFcQOV6oNeuus3YXjMLYfQamcAdeQnkxV_a0LHBouVVs1oaeR8vdWfRdO5dpreYCdyqpwPEWKdV9DQi-vttuHcpJsG_Z0hAZGk3zm6e_QOExJ810b-aSAGDZu4mIU5SZNz4FnvrCT7Lo99peVig1Lbp1m5g43F0Jsk7QafikS8jni9HCAwTm_5VqTIZG1w';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http
      .get<string>(
        'https://we4dns9tid.execute-api.eu-central-1.amazonaws.com/prod/getMovieUrl?file=144.mp4',
        // https://kqv7o8kla6.execute-api.eu-central-1.amazonaws.com/prod/getMovieUrl
        { headers }
      )
      .subscribe({
        next: (result) => {
          console.log(result);
        },
        error: (result) => {
          console.log(result);
        },
      });
  }
}
