import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AllMoviesComponent } from './all-movies/all-movies.component';
import {LayoutModule} from "../layout/layout.module";



@NgModule({
  declarations: [
    AllMoviesComponent,
  ],
    imports: [
        CommonModule,
        LayoutModule
    ]
})
export class MoviesPageModule { }
