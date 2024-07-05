import { Component } from '@angular/core';
import {Movie} from "../models/movie.model";
import {AuthServiceService} from "../../service/auth-service.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-all-movies',
  templateUrl: './all-movies.component.html',
  styleUrls: ['./all-movies.component.css']
})
export class AllMoviesComponent {

  role: string = '';
  constructor(private auth: AuthServiceService, private router: Router) {
  }

  ngOnInit(): void {
    this.role = this.auth.getCurrentRole();
  }

  movies: Movie[] = [
    {
      title: 'Movie 1',
      description: 'Description for movie 1',
      imageUrl: 'assets/images/netflix.png'
    },
    {
      title: 'Movie 2',
      description: 'Description for movie 2',
      imageUrl: 'assets/images/netflix.png'
    },
    {
      title: 'Movie 3',
      description: 'Description for movie 3',
      imageUrl: 'assets/images/netflix.png'
    },
    {
      title: 'Movie 4',
      description: 'Description for movie 4',
      imageUrl: 'assets/images/netflix.png'
    },
    {
      title: 'Movie 5',
      description: 'Description for movie 5',
      imageUrl: 'assets/images/netflix.png'
    },
    {
      title: 'Movie 1',
      description: 'Description for movie 1',
      imageUrl: 'assets/images/netflix.png'
    },
    {
      title: 'Movie 2',
      description: 'Description for movie 2',
      imageUrl: 'assets/images/netflix.png'
    },
    {
      title: 'Movie 3',
      description: 'Description for movie 3',
      imageUrl: 'assets/images/netflix.png'
    },
    {
      title: 'Movie 4',
      description: 'Description for movie 4',
      imageUrl: 'assets/images/netflix.png'
    },
    {
      title: 'Movie 5',
      description: 'Description for movie 5',
      imageUrl: 'assets/images/netflix.png'
    }
  ];
}
