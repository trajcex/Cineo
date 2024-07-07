import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllMoviesComponent } from './all-movies/all-movies.component';
import {LayoutModule} from "../layout/layout.module";
import {RouterLink} from "@angular/router";
import {MatIconModule} from "@angular/material/icon";
import {FormsModule} from "@angular/forms";



@NgModule({
  declarations: [
    AllMoviesComponent,
  ],
  imports: [
    CommonModule,
    LayoutModule,
    RouterLink,
    MatIconModule,
    FormsModule
  ]
})
export class MoviesPageModule { }
