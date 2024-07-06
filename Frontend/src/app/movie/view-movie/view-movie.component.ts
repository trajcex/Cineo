import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Movie } from 'src/app/model/movieInfo';
import { LambdaService } from 'src/app/service/lambda.service';

@Component({
  selector: 'app-view-movie',
  templateUrl: './view-movie.component.html',
  styleUrls: ['./view-movie.component.css']
})
export class ViewMovieComponent {

  constructor(private lambdaService: LambdaService, private router: Router) {}

  base64: string = 'data:video/mp4;base64,';
  videoBase64: string | undefined;
  ngOnInit(): void {
    this.lambdaService.getMovie('a4ccef0b-decb-4782-8985-6edb13548c35','maric','720').subscribe({

      next:(movie: Movie) => {
        // this.videoBase64 = movie;
        this.videoBase64 = movie.video_content;
        this.videoBase64 = this.cleanBase64String(movie.video_content);
        this.videoBase64 = this.base64 + this.videoBase64;
        console.log(this.videoBase64);
      }
    })
  }
  cleanBase64String(base64Str: string | ""): string {
    return base64Str.slice(2,-1);
  }



}
