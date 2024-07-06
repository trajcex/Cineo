import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllMoviesComponent } from './all-movies/all-movies.component';
import {LayoutModule} from "../layout/layout.module";
import {RouterLink} from "@angular/router";



@NgModule({
  declarations: [
    AllMoviesComponent,
  ],
  imports: [
    CommonModule,
    LayoutModule,
    RouterLink
  ]
})
export class MoviesPageModule { }
