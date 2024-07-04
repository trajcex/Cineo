import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AllMoviesComponent} from "./movies-page/all-movies/all-movies.component";
import {AddMovieComponent} from "./movie/add-movie/add-movie.component";
import {ViewMovieComponent} from "./movie/view-movie/view-movie.component";
import {LogInComponent} from "./infrastructure/auth/log-in/log-in.component";

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {path: "login", component: LogInComponent},
  {path : "home", component : AllMoviesComponent},
  {path : "add-movie", component : AddMovieComponent},
  {path : "view-movie", component : ViewMovieComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
