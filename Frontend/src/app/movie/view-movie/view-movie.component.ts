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
  id : string = "68623db8-1c3e-401e-af4c-8635b69ae82c"
  fileName: string = "neki"


  selectedResolution: string = 'file'; 

  base64: string = 'data:video/mp4;base64,';
  movie: Movie | undefined;
  videoBase64: string = "";
  title: string = "";
  downloadUrl : string | undefined;
  ngOnInit(): void {
    this.lambdaService.getMovie(this.id,this.fileName, this.selectedResolution).subscribe({
      next:(movie: Movie) => {
        this.movie = movie;
        // this.videoBase64 = movie.video_content;
        this.movie.video_content = movie.video_content?.slice(2,-1);
        this.videoBase64 = this.base64 + this.movie.video_content;
        console.log(this.movie);
      }
    })
  }

  onDownload(): void {
    this.lambdaService.getMovieUrl(this.id,this.fileName, this.selectedResolution).subscribe({
      next:movie => {
        console.log(movie.video_content);
        fetch(movie.video_content || "")
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.blob(); 
          })
          .then(blob => {
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${this.movie?.fileName}.mp4`; 
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(downloadUrl);
          })
          .catch(error => {
            console.error('Error fetching the file:', error);
          });
    }
  })
  }

  onDelete(): void {
    this.lambdaService.deleteMovie(this.id, this.fileName).subscribe({
      next: result =>  {
        console.log(result);
        this.router.navigate(['/home']);
      },
      error: () =>{
        console.log("Error");
      }
    })
  }

  onResolutionChange(): void {
    this.lambdaService.getMovie(this.id,this.fileName, this.selectedResolution).subscribe({
      next: (movie: Movie) =>{
        movie.video_content = movie.video_content?.slice(2,-1);
        this.videoBase64 = this.base64 + movie.video_content;
        console.log(this.movie);
      }
    })
  }
}
