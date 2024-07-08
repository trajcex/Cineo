import { Component } from '@angular/core';
import {AuthServiceService} from "../../service/auth-service.service";
import {Router} from "@angular/router";
import {LambdaService} from "../../service/lambda.service";
import {MovieCard} from "../models/movie.model";

@Component({
  selector: 'app-all-movies',
  templateUrl: './all-movies.component.html',
  styleUrls: ['./all-movies.component.css']
})
export class AllMoviesComponent {

  role: string = '';
  searchType: string = 'title';
  searchValue: string = '';
  movies: MovieCard[] = []
    constructor(private auth: AuthServiceService, private router: Router, private lambdaService: LambdaService) {
  }
  ngOnInit(): void {
    this.loadAllMovies();
    this.role = this.auth.getCurrentRole();
  }

  loadAllMovies() {
    this.lambdaService.getFeed().subscribe({
      next: (data: MovieCard[]) => {
        if (data.length === 0){
          this.lambdaService.getAllMovies().subscribe({
            next: (data: MovieCard[]) => {
              this.movies = data;
              console.log("GetAll:", this.movies);
            },
            error: (error) => {
              console.error('Error fetching movies', error);
            }
          });
        }else{
          this.movies = data;
        }
        
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
      next: (data: MovieCard[]) => {
        this.movies = data;
        console.log(this.movies);
      },
      error: (error) => {
        console.error('Error fetching movies', error);
      }
    });
  }
}
