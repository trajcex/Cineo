import { Component } from '@angular/core';
import {Movie} from "../models/movie.model";
import {AuthServiceService} from "../../service/auth-service.service";
import {Router} from "@angular/router";
import {LambdaService} from "../../service/lambda.service";

@Component({
  selector: 'app-all-movies',
  templateUrl: './all-movies.component.html',
  styleUrls: ['./all-movies.component.css']
})
export class AllMoviesComponent {

  role: string = '';
  searchType: string = 'title';
  searchValue: string = '';
  movies: Movie[] = []
    constructor(private auth: AuthServiceService, private router: Router, private lambdaService: LambdaService) {
  }
  ngOnInit(): void {
    this.loadAllMovies();
    this.role = this.auth.getCurrentRole();
  }

  loadAllMovies() {
    this.lambdaService.getAllMovies().subscribe({
      next: (data: Movie[]) => {
        this.movies = data;
        console.log(this.movies);
      },
      error: (error) => {
        console.error('Error fetching movies', error);
      }
    });
  }

  onSearch(): void {
    if(this.searchValue === ''){
      this.loadAllMovies();
      return;
    }
    console.log(this.searchType);
    console.log(this.searchValue);
    this.lambdaService.searchMovies(this.searchType, this.searchValue).subscribe({
      next: (data: Movie[]) => {
        this.movies = data;
        console.log(this.movies);
      },
      error: (error) => {
        console.error('Error fetching movies', error);
      }
    });
  }
}
