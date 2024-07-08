import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AllMoviesComponent} from "./movies-page/all-movies/all-movies.component";
import {AddMovieComponent} from "./movie/add-movie/add-movie.component";
import {ViewMovieComponent} from "./movie/view-movie/view-movie.component";
import {LogInComponent} from "./infrastructure/auth/log-in/log-in.component";
import {AuthGuard} from "./infrastructure/auth/auth.guard";
import { ChangeMovieComponent } from './movie/change-movie/change-movie.component';
import { MySubscriptionsComponent } from './subscriptions/my-subscriptions/my-subscriptions.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {path : "home", component : AllMoviesComponent},
  {path : "add-movie", component : AddMovieComponent, canActivate: [AuthGuard], data: {role: ['admin']}},
  {path : "view-movie", component : ViewMovieComponent, canActivate: [AuthGuard], data: {role: ['guest', 'admin']}},
  {path : "change-movie", component : ChangeMovieComponent, canActivate: [AuthGuard], data: {role: ['admin']}},
  {path : "subscriptions", component : MySubscriptionsComponent, canActivate: [AuthGuard], data: {role: ['guest']}},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
