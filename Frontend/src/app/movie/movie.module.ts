import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddMovieComponent } from './add-movie/add-movie.component';
import { ViewMovieComponent } from './view-movie/view-movie.component';



@NgModule({
  declarations: [
    AddMovieComponent,
    ViewMovieComponent
  ],
  imports: [
    CommonModule
  ]
})
export class MovieModule { }
