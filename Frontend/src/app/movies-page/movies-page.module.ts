import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllMoviesComponent } from './all-movies/all-movies.component';
import { AdminMoviesComponent } from './admin-movies/admin-movies.component';



@NgModule({
  declarations: [
    AllMoviesComponent,
    AdminMoviesComponent
  ],
  imports: [
    CommonModule
  ]
})
export class MoviesPageModule { }
